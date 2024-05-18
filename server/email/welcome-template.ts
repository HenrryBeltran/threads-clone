export function WelcomeTemplate(username: string, verificationCode: string) {
  return `
    <section>
      <h1 style="fontSize: 20px;">Dear ${username},</h1>
      <p style="maxWidth: 512px;">
        Welcome to Threads! We&apos;re thrilled to have you join our community. To get
        started, please confirm your account by verifying the code below. This code will
        be only valid for 10 minutes.
      </p>
      <p style="fontWeight: 500;">
        Verification Code:${" "}
        <strong style="fontFamily: 'monospace'; fontSize: 18px;">
          ${verificationCode}
        </strong>
      </p>
      <p style=maxWidth: 512px;>
        Once your account is confirmed, you&apos;ll be able to connect with friends, post
        a thread, and discover new threads of conversation.
      </p>
    </section>
    `;
}
