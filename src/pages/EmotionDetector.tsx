import { useEffect, useRef, useState } from "react";
import * as faceapi from "@vladmandic/face-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Camera, StopCircle, RefreshCw } from "lucide-react";

const CDN_MODELS = "https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.15/model";

const setSEO = (title: string, description: string, canonicalPath: string) => {
  document.title = title;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute("content", description);
  else {
    const m = document.createElement("meta");
    m.name = "description";
    m.content = description;
    document.head.appendChild(m);
  }
  const canonical = document.querySelector('link[rel="canonical"]');
  const href = `${window.location.origin}${canonicalPath}`;
  if (canonical) canonical.setAttribute("href", href);
  else {
    const l = document.createElement("link");
    l.setAttribute("rel", "canonical");
    l.setAttribute("href", href);
    document.head.appendChild(l);
  }
};

const EmotionDetector = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);

  const [isReady, setIsReady] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [emotion, setEmotion] = useState<string>("–");
  const [confidence, setConfidence] = useState<number>(0);

  const { toast } = useToast();

  useEffect(() => {
    setSEO(
      "Emotion Detector | EmergencyLinkUp",
      "Open your camera to scan your face and detect emotions in real-time.",
      "/dashboard/emotion"
    );
  }, []);

  // Load models once
  useEffect(() => {
    const loadModels = async () => {
      try {
        // Try CDN model loading (lightweight: tiny face + expressions)
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(CDN_MODELS),
          faceapi.nets.faceExpressionNet.loadFromUri(CDN_MODELS),
        ]);
        setIsReady(true);
      } catch (err) {
        console.error("Failed loading models", err);
        toast({
          title: "Model load failed",
          description: "Could not load detection models. Check your connection and retry.",
          variant: "destructive",
        });
      }
    };
    loadModels();
  }, [toast]);

  const stopStream = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsRunning(false);
  };

  useEffect(() => {
    return () => stopStream();
  }, []);

  const start = async () => {
    if (!isReady) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      streamRef.current = stream;
      if (!videoRef.current) return;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();

      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;

      const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 256, scoreThreshold: 0.5 });

      // Run at ~3 FPS to keep CPU/GPU low
      timerRef.current = window.setInterval(async () => {
        if (!videoRef.current || videoRef.current.readyState < 2) return;
        try {
          const result = await faceapi
            .detectSingleFace(videoRef.current, options)
            .withFaceExpressions();

          const ctx = canvas.getContext("2d");
          if (!ctx) return;
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          if (result) {
            const dims = { width: video.videoWidth, height: video.videoHeight };
            const resized = faceapi.resizeResults(result, dims);
            faceapi.draw.drawDetections(canvas, resized.detection);

            if (resized.expressions) {
              const entries = Object.entries(resized.expressions);
              entries.sort((a, b) => (b[1] as number) - (a[1] as number));
              const [top, score] = [entries[0][0], entries[0][1] as number];
              setEmotion(top);
              setConfidence(score);

              // Overlay label
              const { x, y, width, height } = resized.detection.box;
              ctx.fillStyle = "rgba(0,0,0,0.6)";
              ctx.fillRect(x, Math.max(0, y - 24), Math.max(90, width * 0.5), 22);
              ctx.fillStyle = "#fff";
              ctx.font = "14px system-ui, -apple-system, Segoe UI, Roboto";
              ctx.fillText(`${top} ${(score as number * 100).toFixed(0)}%`, x + 8, Math.max(14, y - 8));
            }
          } else {
            setEmotion("–");
            setConfidence(0);
          }
        } catch (err) {
          console.error("Detection error", err);
        }
      }, 330);

      setIsRunning(true);
      toast({ title: "Camera started", description: "Scanning for facial emotions." });
    } catch (err) {
      console.error(err);
      toast({
        title: "Camera access denied",
        description: "Please allow camera permissions and try again.",
        variant: "destructive",
      });
    }
  };

  const restart = async () => {
    stopStream();
    await start();
  };

  return (
    <main className="min-h-screen py-10 px-4">
      <section className="max-w-5xl mx-auto">
        <h1 className="sr-only">Emotion Detector - Real-time Facial Emotion Analysis</h1>
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="text-2xl">Emotion Detector (Camera)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6 items-start">
              <div className="relative w-full aspect-video bg-muted rounded-lg overflow-hidden border">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="absolute inset-0 w-full h-full object-cover"
                  aria-label="Live camera preview for emotion detection"
                />
                <canvas
                  ref={canvasRef}
                  className="absolute inset-0 w-full h-full"
                  aria-hidden="true"
                />
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="text-lg font-semibold">{isRunning ? "Scanning…" : isReady ? "Ready" : "Loading models…"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Detected Emotion</p>
                  <p className="text-2xl font-bold capitalize">{emotion}</p>
                  <p className="text-sm text-muted-foreground">Confidence: {(confidence * 100).toFixed(0)}%</p>
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <Button onClick={start} disabled={!isReady || isRunning}>
                    <Camera className="mr-2 h-4 w-4" /> Start Camera
                  </Button>
                  <Button variant="secondary" onClick={restart} disabled={!isReady}>
                    <RefreshCw className="mr-2 h-4 w-4" /> Restart
                  </Button>
                  <Button variant="destructive" onClick={stopStream} disabled={!isRunning}>
                    <StopCircle className="mr-2 h-4 w-4" /> Stop
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground">
                  Tip: Ensure your face is well lit and centered. Supported emotions include neutral, happy, sad,
                  angry, fearful, disgusted, and surprised.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
};

export default EmotionDetector;
