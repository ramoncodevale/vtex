import React, { ChangeEvent, useState } from 'react'
import { FormAlert } from './components/FormAlert'
import { FormHeader } from './components/FormHeader'
import { formatPhone } from './utils/formatPhone'

import './style.css'

type Status = 'idle' | 'loading' | 'success' | 'error'

interface FormState {
  clientName: string
  email: string
  phone: string
  orderId: string
  skuId: string
  productName: string
  message: string
  image: string
}

const initialFormState: FormState = {
  clientName: '',
  email: '',
  phone: '',
  orderId: '',
  skuId: '',
  productName: '',
  message: '',
  image: '',
}

const MAX_FILE_SIZE = 500 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/png']

const ProductReportForm = () => {
  const [form, setForm] = useState<FormState>(initialFormState)
  const [status, setStatus] = useState<Status>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const showError = (message: string) => {
    setStatus('error')
    setErrorMessage(message)
  }

  const handleInputChange =
    (field: keyof FormState) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = event.target.value

      if (field === 'phone') {
        setForm((prev) => ({
          ...prev,
          phone: formatPhone(value),
        }))
        return
      }

      setForm((prev) => ({
        ...prev,
        [field]: value,
      }))
    }

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!ALLOWED_TYPES.includes(file.type)) {
      showError('Envie apenas imagens JPG ou PNG.')
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      showError('A imagem deve ter no máximo 500KB.')
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setForm((prev) => ({
        ...prev,
        image: reader.result as string,
      }))
    }

    reader.readAsDataURL(file)
  }

  const validateForm = () => {
    if (!form.clientName.trim()) return 'Informe seu nome completo.'
    if (!form.email.trim()) return 'Informe um e-mail válido.'
    if (!form.orderId.trim()) return 'Informe o número do pedido.'
    if (!form.skuId.trim()) return 'Informe o SKU.'
    if (!form.message.trim()) return 'Escreva a mensagem.'
    return null
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    const validationError = validateForm()
    if (validationError) {
      showError(validationError)
      return
    }

    setStatus('loading')
    setErrorMessage('')

    try {
      const response = await fetch('/api/dataentities/PR/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          clientName: form.clientName,
          email: form.email,
          phone: form.phone,
          orderId: form.orderId,
          skuId: form.skuId,
          productName: form.productName,
          message: form.message,
          image: form.image,

          // 🔥 CAMPO USADO PELO TRIGGER
          sendEmail: true,

          // opcional (ajuda em triggers e controle)
          status: 'new',
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        console.error(error)
        showError('Erro ao enviar os dados para o Master Data.')
        return
      }

      setStatus('success')
      setForm(initialFormState)
    } catch (error) {
      console.error(error)
      showError('Erro inesperado. Tente novamente.')
    }
  }

  return (
    <section className="lp-garantia-form">
      <FormHeader />

      <form className="form-card" onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label>Nome completo *</label>
            <input
              value={form.clientName}
              onChange={handleInputChange('clientName')}
            />
          </div>

          <div className="form-group">
            <label>E-mail *</label>
            <input
              type="email"
              value={form.email}
              onChange={handleInputChange('email')}
            />
          </div>

          <div className="form-group">
            <label>Telefone</label>
            <input
              value={form.phone}
              onChange={handleInputChange('phone')}
            />
          </div>

          <div className="form-group">
            <label>Número do pedido *</label>
            <input
              value={form.orderId}
              onChange={handleInputChange('orderId')}
            />
          </div>

          <div className="form-group">
            <label>SKU *</label>
            <input
              value={form.skuId}
              onChange={handleInputChange('skuId')}
            />
          </div>

          <div className="form-group">
            <label>Nome do produto</label>
            <input
              value={form.productName}
              onChange={handleInputChange('productName')}
            />
          </div>

          <div className="form-group full">
            <label>Mensagem *</label>
            <textarea
              rows={5}
              value={form.message}
              onChange={handleInputChange('message')}
            />
          </div>

          <div className="form-group full">
            <label>Imagem (JPG ou PNG – até 500KB)</label>
            <input
              type="file"
              accept="image/jpeg,image/png"
              onChange={handleImageChange}
            />
          </div>
        </div>

        <div className="form-footer">
          <button type="submit" disabled={status === 'loading'}>
            {status === 'loading' ? 'Enviando...' : 'Enviar formulário'}
          </button>
        </div>
      </form>

      <FormAlert status={status} message={errorMessage} />
    </section>
  )
}

export default ProductReportForm
