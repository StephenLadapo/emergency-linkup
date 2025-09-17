import { useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { updateScreenshotProtection } from '@/lib/auth';

interface ScreenshotProtectionProps {
  enabled?: boolean;
  sensitivePages?: string[];
}

const ScreenshotProtection = ({ 
  enabled = true, 
  sensitivePages = ['/dashboard', '/emergency-flow', '/profile'] 
}: ScreenshotProtectionProps) => {
  const { userProfile } = useAuth();
  const isProtectionEnabled = userProfile?.screenshot_protection ?? enabled;
  
  // Update protection setting in database when it changes
  useEffect(() => {
    if (userProfile && userProfile.screenshot_protection !== isProtectionEnabled) {
      updateScreenshotProtection(userProfile.id, isProtectionEnabled).catch(console.error);
    }
  }, [isProtectionEnabled, userProfile]);
  
  useEffect(() => {
    if (!isProtectionEnabled) return;

    // Check if current page is sensitive
    const currentPath = window.location.pathname;
    const isSensitivePage = sensitivePages.some(page => currentPath.startsWith(page));
    
    if (!isSensitivePage) return;

    // Disable right-click context menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      toast.warning('Right-click is disabled on this page for security reasons', {
        duration: 3000,
        position: 'top-center'
      });
    };

    // Disable common screenshot shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // Print Screen
      if (e.key === 'PrintScreen') {
        e.preventDefault();
        toast.warning('Screenshots are disabled for security reasons', {
          duration: 3000,
          position: 'top-center'
        });
        return;
      }

      // Ctrl/Cmd + Shift + S (Firefox screenshot)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        toast.warning('Screenshots are disabled for security reasons', {
          duration: 3000,
          position: 'top-center'
        });
        return;
      }

      // Ctrl/Cmd + Shift + 3/4/5 (macOS screenshots)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && ['3', '4', '5'].includes(e.key)) {
        e.preventDefault();
        toast.warning('Screenshots are disabled for security reasons', {
          duration: 3000,
          position: 'top-center'
        });
        return;
      }

      // F12 (Developer tools)
      if (e.key === 'F12') {
        e.preventDefault();
        toast.warning('Developer tools are disabled for security reasons', {
          duration: 3000,
          position: 'top-center'
        });
        return;
      }

      // Ctrl/Cmd + Shift + I (Developer tools)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'I') {
        e.preventDefault();
        toast.warning('Developer tools are disabled for security reasons', {
          duration: 3000,
          position: 'top-center'
        });
        return;
      }

      // Ctrl/Cmd + U (View source)
      if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
        e.preventDefault();
        toast.warning('View source is disabled for security reasons', {
          duration: 3000,
          position: 'top-center'
        });
        return;
      }
    };

    // Disable drag and drop
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
    };

    // Disable text selection on sensitive elements
    const handleSelectStart = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('no-select') || target.closest('.no-select')) {
        e.preventDefault();
      }
    };

    // Add blur effect when window loses focus (potential screenshot attempt)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        document.body.style.filter = 'blur(5px)';
        document.body.style.transition = 'filter 0.3s ease';
        toast.warning('Screen blurred for security', {
          duration: 2000,
          position: 'top-center'
        });
      } else {
        document.body.style.filter = 'none';
      }
    };

    // Detect potential screenshot tools
    const detectScreenshotTools = () => {
      // Check for common screenshot tool processes (limited in browser)
      if (navigator.userAgent.includes('Lightshot') || 
          navigator.userAgent.includes('Snagit') ||
          navigator.userAgent.includes('Greenshot')) {
        toast.warning('Screenshot tools detected. Screenshots are disabled for security.', {
          duration: 5000,
          position: 'top-center'
        });
      }
    };

    // Add event listeners
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('dragstart', handleDragStart);
    document.addEventListener('selectstart', handleSelectStart);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Run detection
    detectScreenshotTools();

    // Add CSS to prevent text selection and disable certain interactions
    const style = document.createElement('style');
    style.textContent = `
      .screenshot-protected {
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        -webkit-touch-callout: none;
        -webkit-tap-highlight-color: transparent;
      }
      
      .screenshot-protected img {
        -webkit-user-drag: none;
        -khtml-user-drag: none;
        -moz-user-drag: none;
        -o-user-drag: none;
        user-drag: none;
        pointer-events: none;
      }
      
      .no-select {
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
      }
    `;
    document.head.appendChild(style);

    // Add protection class to body
    document.body.classList.add('screenshot-protected');

    // Cleanup function
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('dragstart', handleDragStart);
      document.removeEventListener('selectstart', handleSelectStart);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      document.body.classList.remove('screenshot-protected');
      document.body.style.filter = 'none';
      
      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }
    };
  }, [isProtectionEnabled, sensitivePages]);

  return null; // This component doesn't render anything
};

export default ScreenshotProtection;