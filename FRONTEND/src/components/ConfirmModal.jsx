import {
    AlertTriangle,
    CheckCircle2,
    Info,
    X
} from "lucide-react";


function ConfirmModal({
    open,
    type = "warning",
    title,
    message,
    confirmText = "Confirmer",
    cancelText = "Annuler",
    onConfirm,
    onCancel,
    loading = false
}) {

    if (!open) {
        return null;
    }


    const icons = {
        warning: AlertTriangle,
        danger: AlertTriangle,
        success: CheckCircle2,
        info: Info
    };


    const Icon = icons[type] || AlertTriangle;


    return (
        <div
            className="confirm-overlay"
            onMouseDown={(event) => {

                if (
                    event.target === event.currentTarget &&
                    !loading
                ) {
                    onCancel();
                }

            }}
        >

            <div
                className={`confirm-modal ${type}`}
                role="dialog"
                aria-modal="true"
                aria-labelledby="confirm-title"
            >

                <button
                    type="button"
                    className="confirm-close"
                    onClick={onCancel}
                    disabled={loading}
                    aria-label="Fermer"
                >
                    <X size={18} />
                </button>


                <div className="confirm-icon">
                    <Icon size={26} />
                </div>


                <div className="confirm-content">

                    <h2 id="confirm-title">
                        {title}
                    </h2>

                    <p>
                        {message}
                    </p>

                </div>


                <div className="confirm-actions">

                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={onCancel}
                        disabled={loading}
                    >
                        {cancelText}
                    </button>


                    <button
                        type="button"
                        className={`btn confirm-button ${type}`}
                        onClick={onConfirm}
                        disabled={loading}
                    >

                        {loading
                            ? "Traitement..."
                            : confirmText
                        }

                    </button>

                </div>

            </div>

        </div>
    );
}


export default ConfirmModal;