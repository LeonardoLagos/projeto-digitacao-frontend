import { zodResolver } from "@hookform/resolvers/zod";
import { Button, TextField } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { apiLogin } from "../../services/apiLogin";
import { UserContext, Usuario } from "../../contexts/userContext";


const schema = z.object({
  email: z.string().email("* Insira um e-mail válido").min(1, '* Campo obrigatório'),
  senha: z.string().min(8, "* Senhas contém no mínimo 8 caractéres.").max(100)
})

type FormData = z.infer<typeof schema>

export default function Login() {
  const navigate = useNavigate()
  const { setUser } = useContext(UserContext)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema)
  })

  const [erroEmail, setErroEmail] = useState('')
  const [erroSenha, setErroSenha] = useState('')

  useEffect(() => {
    setErroEmail(errors.email?.message as string)
    setErroSenha(errors.senha?.message as string)
  }, [errors.email?.message, errors.senha?.message])

  function onSubmit(data: FormData) {
    apiLogin.post('/login', {
      email: data.email,
      senha: data.senha,
      googleId: ''
    }).then((retorno) => {
      localStorage.setItem('token', retorno.data)
      apiLogin.post('/token', {
        token: localStorage.getItem('token')
      }).then((retorno) => {
        localStorage.setItem('id_usuario', retorno.data.id)
        setUser({
          id: retorno.data.id,
          nome: retorno.data.nome,
          email: retorno.data.email,
          fotoPerfil: retorno.data.foto_perfil
        } as Usuario)
      }).catch((retorno) => {
        console.log(retorno)
      })
      navigate('/')
    }).catch((retorno) => {
      if (retorno.response?.data)
        setErroEmail(retorno.response.data.message)
    })
  }

  return (
    <div className="flex w-screen h-screen">
      <div className="w-4/6 h-full">
        <img className="h-full object-cover" src="src/assets/bg-login.jpeg" alt="" />
      </div>
      <form
        className="flex flex-col w-2/6 h-full text-slate-50 justify-center px-12"
        onSubmit={handleSubmit(onSubmit)}>
        <TextField label="e-mail" helperText={erroEmail} variant="standard" type="email" margin="none" {...register("email")} />
        <TextField label="senha" helperText={erroSenha} variant="standard" type="password" margin="none"  {...register("senha")} />
        <Button type="submit" sx={{ marginTop: '8px', marginBottom: '8px' }}>Entrar</Button>
        <div className="flex flex-col items-center text-sm">
          <a href="#" className="text-center text-yellow-300">Esqueceu sua senha?</a>
          <p>Não possui conta? <a href="/cadastro" className="text-center text-yellow-300">Cadastrar-se</a></p>
        </div>
      </form>
    </div>
  )
}
