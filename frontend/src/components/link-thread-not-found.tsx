type Props = {
  error?: Error | null;
};

export function LinkThreadNotFound({ error }: Props) {
  if (error === undefined) {
    return (
      <div className="relative">
        <div className="group flex flex-col pt-4">
          <div className="flex items-center gap-3 pb-3">
            <div className="h-11 w-11 rounded-full bg-muted-foreground/20" />
            <div className="h-5 w-16 rounded-md bg-muted-foreground/20" />
          </div>
          <div className="flex-grow">
            <div className="ml-8 px-6">
              <div className="flex h-32 w-full items-center justify-center rounded-md bg-muted-foreground/10 p-6 text-muted-foreground">
                This thread has been deleted.
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-5 h-[calc(100%-76px)] w-0.5 bg-muted-foreground/40" />
      </div>
    );
  }

  return (
    <>
      {error !== null && JSON.parse(error?.message!).status === 404 && (
        <div className="relative">
          <div className="group flex flex-col pt-4">
            <div className="flex items-center gap-3 pb-3">
              <div className="h-11 w-11 rounded-full bg-muted-foreground/20" />
              <div className="h-5 w-16 rounded-md bg-muted-foreground/20" />
            </div>
            <div className="flex-grow">
              <div className="ml-8 px-6">
                <div className="flex h-32 w-full items-center justify-center rounded-md bg-muted-foreground/10 p-6 text-muted-foreground">
                  This thread has been deleted.
                </div>
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 left-5 h-[calc(100%-76px)] w-0.5 bg-muted-foreground/40" />
        </div>
      )}
    </>
  );
}
