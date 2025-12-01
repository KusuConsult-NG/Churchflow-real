import crypto from "crypto"

/**
 * Generate a secure random token for invite links
 */
export function generateInviteToken(): string {
    return crypto.randomBytes(32).toString("hex")
}

/**
 * Send invite email (currently logs to console)
 * TODO: Integrate with SendGrid, Resend, or Nodemailer
 */
export async function sendInviteEmail(
    email: string,
    name: string,
    token: string,
    organizationName: string
) {
    const inviteLink = `${process.env.NEXTAUTH_URL}/auth/register/${token}`

    // For now, log to console. Replace with actual email service later
    console.log("\n" + "=".repeat(80))
    console.log("📧 INVITE EMAIL")
    console.log("=".repeat(80))
    console.log(`To: ${email}`)
    console.log(`Subject: You're invited to join ${organizationName} on ChurchFlow`)
    console.log("\n" + "-".repeat(80))
    console.log(`Hi ${name},`)
    console.log(`\nYou've been invited to join ${organizationName} as an administrator on ChurchFlow.`)
    console.log(`\nClick the link below to set up your account:`)
    console.log(`\n${inviteLink}`)
    console.log(`\nThis link will expire in 24 hours.`)
    console.log(`\nBest regards,`)
    console.log(`The ChurchFlow Team`)
    console.log("-".repeat(80) + "\n")

    return {
        success: true,
        inviteLink // Return for testing purposes
    }
}

/**
 * Verify invite token
 */
export function isTokenExpired(expiryDate: Date): boolean {
    return new Date() > expiryDate
}
