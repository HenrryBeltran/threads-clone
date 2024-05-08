import { createSignal } from "solid-js";

const [isModalOpen, setIsModalOpen] = createSignal(false);

function openLoginModal() {
  setIsModalOpen(true);
}

function closeLoginModal() {
  setIsModalOpen(false);
}

export { closeLoginModal, isModalOpen, openLoginModal };
