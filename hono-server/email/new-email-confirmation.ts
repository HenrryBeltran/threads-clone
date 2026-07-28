export function NewEmailConfirmation(username: string) {
  return `
    <section>
      <h1 style="fontSize: "16px"; fontWeight: 400;">Hello ${username},</h1>
      <p style="maxWidth: 512px;">
        Your Threads Clone email has been successfully updated.
      </p>
    </section>
  `;
}
