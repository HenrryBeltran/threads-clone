export function ResetPasswordTemplate(email: string, resetPasswordLink: string) {
  return `
    <section>
      <h1 style="fontSize: 16px; fontWeight: 400;">Hello!</h1>
      <p style="maxWidth: 512px;">
        We received a request to reset the password for the threads clone account
        associated with ${email}
      </p>
      <a href="${resetPasswordLink}">${resetPasswordLink}</a>
      <p style="maxWidth: 512px;">
        Please be aware that if you do not complete this process within 1 hour, the above
        URL will become invalid.
      </p>
      <p style="maxWidth: 512px;">
        If you didn&apos;t make this request, you can ignore it. No changes have been made
        to your account.
      </p>
    </section>
  `;
}
