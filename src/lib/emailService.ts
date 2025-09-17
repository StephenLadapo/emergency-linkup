import emailjs from '@emailjs/browser';

// Initialize EmailJS
emailjs.init("ZVJqFtna5EaBhHwj4");

export const sendVerificationEmail = async (email: string, fullName: string, verificationLink: string) => {
  try {
    const templateParams = {
      to_name: fullName,
      to_email: email,
      verification_link: verificationLink,
      app_name: 'EmergencyLinkUp - University of Limpopo'
    };

    await emailjs.send(
      "service_fprjlcl",
      "template_verification",
      templateParams
    );

    return true;
  } catch (error) {
    console.error('Failed to send verification email:', error);
    throw error;
  }
};

export const send2FACode = async (email: string, fullName: string, code: string) => {
  try {
    const templateParams = {
      to_name: fullName,
      to_email: email,
      verification_code: code,
      expiry_time: '10 minutes',
      app_name: 'EmergencyLinkUp - University of Limpopo'
    };

    await emailjs.send(
      "service_fprjlcl",
      "template_gu18aiq", // Using existing template
      templateParams
    );

    return true;
  } catch (error) {
    console.error('Failed to send 2FA code:', error);
    throw error;
  }
};

export const sendEmergencyAlert = async (
  recipientEmail: string, 
  recipientName: string, 
  studentName: string, 
  emergencyType: string, 
  location?: string
) => {
  try {
    const templateParams = {
      to_name: recipientName,
      to_email: recipientEmail,
      student_name: studentName,
      emergency_type: emergencyType,
      location: location || 'Location not available',
      timestamp: new Date().toLocaleString(),
      app_name: 'EmergencyLinkUp - University of Limpopo'
    };

    await emailjs.send(
      "service_fprjlcl",
      "template_emergency",
      templateParams
    );

    return true;
  } catch (error) {
    console.error('Failed to send emergency alert:', error);
    throw error;
  }
};