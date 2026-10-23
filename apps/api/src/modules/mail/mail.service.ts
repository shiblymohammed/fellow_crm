import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor() {}

  async sendPasswordResetEmail(to: string, token: string) {
    const resetLink = `${process.env.WEB_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
    
    // In a real application, you would use a service like SendGrid, AWS SES, etc.
    // For now, we will just log it to the console.
    console.log(`
      ======================================================
      PASSWORD RESET REQUEST
      ======================================================
      To: ${to}
      Link: ${resetLink}
      
      Please click the link above to reset your password.
      ======================================================
    `);
  }
}
