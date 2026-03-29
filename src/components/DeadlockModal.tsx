// src/components/DeadlockModal.tsx

interface DeadlockModalProps {
  isOpen: boolean;
  onUndo: () => void;
  onRestart: () => void;
}

export function DeadlockModal({ isOpen, onUndo, onRestart }: DeadlockModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="text-2xl mb-4 text-orange-400 font-bold">游戏结束</h2>
        <p className="text-gray-300 mb-6">箱子被推到死角，无法继续！</p>
        <div className="flex justify-center gap-3">
          <button
            className="px-6 py-3 bg-sky-400 text-white rounded-lg font-medium hover:bg-sky-500 transition"
            onClick={onUndo}
          >
            撤销
          </button>
          <button
            className="px-6 py-3 bg-orange-400 text-white rounded-lg font-medium hover:bg-orange-500 transition"
            onClick={onRestart}
          >
            重置
          </button>
        </div>
      </div>
    </div>
  );
}
