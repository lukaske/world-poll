import React, { useRef, useState } from "react";
import { ActivePollsModal } from "@/components/active-polls-modal"; // Adjust the import path as needed
import { Button } from "@/components/ui/button";

const ParentComponent: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const modalRef = useRef<{ refreshPolls: () => Promise<void> }>(null);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const refreshPolls = async () => {
    if (modalRef.current) {
      await modalRef.current.refreshPolls();
    }
  };

  return (
    <div>
      <Button onClick={openModal}>View Active Polls</Button>
      <ActivePollsModal
        ref={modalRef}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </div>
  );
};

export default ParentComponent;