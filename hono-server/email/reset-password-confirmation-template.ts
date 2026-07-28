export function ResetPasswordConfirmationTemplate(resetPasswordLink: string, shortResetPasswordLink: string) {
  return `
    <section>
      <h1 style="fontSize: "16px"; fontWeight: 400;">Hello,</h1>
      <p style="maxWidth: 512px;">
        Your Threads Clone password has been successfully updated.
      </p>
      <p style="maxWidth: 512px;">
        If you did not perform this action, you should go to${" "}
        <a href="${resetPasswordLink}">${shortResetPasswordLink}</a> reset immediately to
        reset your password.
      </p>
    </section>
  `;
}
