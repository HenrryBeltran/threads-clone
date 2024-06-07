import { UserAccount } from "@/lib/api";
import { useCreateThreadStore } from "@/store";
import { useQueryClient } from "@tanstack/react-query";
import Document from "@tiptap/extension-document";
import Mention from "@tiptap/extension-mention";
import Paragraph from "@tiptap/extension-paragraph";
import Placeholder from "@tiptap/extension-placeholder";
import Text from "@tiptap/extension-text";
import { EditorContent, useEditor } from "@tiptap/react";
import { useEffect } from "react";
import { UserImage } from "./user-image";

export function CreateThread() {
  const queryClient = useQueryClient();
  const user = queryClient.getQueryData<UserAccount>(["user", "account"]);
  const createThread = useCreateThreadStore();
  const editor = useEditor({
    extensions: [
      Document,
      Paragraph.configure({ HTMLAttributes: { class: "leading-snug" } }),
      Text,
      Placeholder.configure({
        placeholder: "Start a thread...",
        emptyEditorClass:
          "first:before:content-[attr(data-placeholder)] first:before:pointer-events-none first:before:text-muted-foreground",
      }),
      Mention.configure({
        renderHTML: ({ node, options }) => [
          "span",
          // mergeAttributes({ href: '/profile/1' }, options.HTMLAttributes),
          `${options.renderText}${node.attrs.label ?? node.attrs.id}`,
        ],
        HTMLAttributes: { class: "text-blue-500" },
      }),
    ],
    content: createThread.data.content,
    editorProps: { attributes: { class: "text-foreground outline-none" } },
  });

  const body = document.querySelector("body");

  useEffect(() => {
    if (!body) return;

    if (createThread.data.open) {
      body.style.height = "100svh";
      body.style.overflow = "hidden";
      editor?.chain().focus();
    } else {
      body.style.height = "auto";
      body.style.overflow = "visible";
    }
  }, [createThread.data.open]);

  return (
    <>
      {user && createThread.data.open && (
        <section
          className="absolute left-0 top-0 z-50 flex h-svh w-svw items-center justify-center bg-neutral-700/50 dark:bg-black/80"
          onClick={() => createThread.hide()}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              createThread.hide();
            }
          }}
        >
          <div
            className="w-full max-w-md space-y-4"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <h2 className="text-center text-lg font-bold text-white [text-shadow:0px_4px_4px_rgba(23,23,23,0.6)]">
              New Thread
            </h2>
            <div className="w-full rounded-lg border border-muted-foreground/20 bg-background p-5 dark:bg-neutral-900">
              <div className="flex gap-4">
                <UserImage
                  profilePictureId={user.profilePictureId ?? null}
                  username={user.username}
                  width={48}
                  height={48}
                  fetchPriority="high"
                  className="h-12 w-12"
                />
                <div>
                  <span className="font-semibold leading-snug">{user.username}</span>
                  {editor && <EditorContent editor={editor} autoFocus={true} />}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
