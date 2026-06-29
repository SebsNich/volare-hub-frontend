function Modal({ children, onClose }) {
    return (
        <div>
            <div>
                <button onClick={onClose}>Cerrar</button>
                {children}
            </div>
        </div>
    )
}

export default Modal