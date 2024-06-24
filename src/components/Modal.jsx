import { useEffect } from "react";
import ModelPortal from "./ModalPortal";

const Modal = ({ children, isOpen, handleClose }) => {
  const handleModalClick = (e) => {
    // Check if the clicked element is the modal's background (not the content)
    if (e.target.classList.contains("modal-background")) {
      handleClose();
    }
  };

  useEffect(() => {
    const closeOnEscapeKey = (e) => (e.key === "Escape" ? handleClose() : null);
    document.body.addEventListener("keydown", closeOnEscapeKey);
    return () => {
      document.body.addEventListener("keydown", closeOnEscapeKey);
    };
  }, [handleClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <ModelPortal wrappedId="popup-item-element">
      <div
        className="fixed top-0 left-0 right-0 bottom-0 bg-[#000000] bg-opacity-40 flex flex-col items-center justify-center z-[1000] p-[40px] overflow-hidden modal-background"
        onClick={handleModalClick}
      >
        <div className="w-[90%] sm:w-[70%] h-[90%] sm-h-[70%] bg-white flex items-center justify-center rounded-2xl border-blue-900 border-[1px] overflow-hidden">
          {children}
        </div>
      </div>
    </ModelPortal>
  );
};

export default Modal;
