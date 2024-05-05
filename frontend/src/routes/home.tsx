import { For } from "solid-js";

export default function Home() {
  const links = [
    "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExamFtbTFlZGJkNzJodmdzMzd3M3praGxjdzEyNmNubzE3c2M5NzBkMiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/xoHntNXFYkfzGAftEv/giphy.gif",
    "https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExMHJpdzE2enlzaGRjb2o5ZHdzeGFqYmRremE3bjVoanE1Y3ZmZWt5aiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/zCpYQh5YVhdI1rVYpE/giphy.gif",
    "https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExbHVuOTNxbngxb29rYzEyNWhobWI2NGZjMzBiY2x0b3lvejAybzRiNSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/7QdUZvxWxxDTH9vb0u/giphy.gif",
    "https://media4.giphy.com/media/1nfwnYf5Uz7hzhYof8/giphy.webp",
    "https://media3.giphy.com/media/H2u46cKU3VaXht6Iv9/200.webp",
    "https://media3.giphy.com/media/4pMX5rJ4PYAEM/giphy.webp",
    "https://media0.giphy.com/media/1qZ7Ny4dYqhxwftGvG/giphy.webp",
    "https://media1.giphy.com/media/bCcxY1ADkAqfS/200.webp",
  ];

  return (
    <div class="flex min-h-svh flex-col items-center justify-center gap-16 pb-16 pt-24">
      <For each={links}>
        {(link) => (
          <img src={link} width={320} height={320} class="mx-6" loading="lazy" />
        )}
      </For>
    </div>
  );
}
