export function ConfirmNewEmail(username: string, newEmailLink: string) {
  return `
    <section>
      <h1 style="fontSize: 20px;">Hello ${username},</h1>
      <p style="maxWidth: 512px;">
        This is an email confirmation to update your email account. 
        Click the button bellow to confirm your new email. 
        This link will be only valid for 10 minutes.
      </p>
      <br/>
      <a
        href="${newEmailLink}"
        style="border-radius: 2rem; text-decoration: none; padding: 0.5rem 1.125rem; background-color: #333333; color: #ffffff;"
      >
        Confirm Email
      </a>
      <br/>
      <br/>
    </section>
    `;
}
