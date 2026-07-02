function Modal({ children, onClose }) {
    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0,
            width: '100%', height: '100%',
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999
        }}>
            <div style={{
                background: 'white',
                padding: '24px',
                borderRadius: '8px',
                minWidth: '300px'
            }}>
                <button onClick={onClose}>Cerrar</button>
                {children}
            </div>
        </div>
    )
}

export default Modal