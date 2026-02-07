import React from 'react'

interface Props {
  status: 'idle' | 'loading' | 'success' | 'error'
  message?: string
}

export const FormAlert = ({ status, message }: Props) => {
  if (status === 'idle') return null

  const icons = {
    success: '✅',
    error: '⚠️',
    loading: '⏳',
  }

  const defaultMessages = {
    success: 'Recebemos sua solicitação com sucesso.',
    loading: 'Enviando informações...',
    error: 'Não foi possível enviar agora. Tente novamente.',
  }

  return (
    <div className={`form-alert ${status}`}>
      <span className="form-alert-icon">{icons[status]}</span>

      <div className="form-alert-message">
        {message || defaultMessages[status]}
      </div>
    </div>
  )
}
