import logo1 from '../assets/img/viact-icon.jpg'
import '../assets/login.css'
import axios from "axios";
import { useEffect, useState } from 'react';
import { rtLogin } from '../utils/APIRoutes';
import { setCookie, getCookie, cookieExists, eraseCookie } from "../utils/functions";
import { useNavigate } from 'react-router-dom';

export default function Login() {
	const navigate = useNavigate()
	const [login, setLogin] = useState({
		idusuario: "",
		password: "",
	})
	const [messageLogin, setMessageLogin] = useState('')

	async function handleSubmit(e) {
		e.preventDefault();
		
		var requestData = {
			params: {
				USUARIO: login.idusuario,
				CONTRA: login.password,
				cookieAccess: false
			}
		};
		const { data } = await axios.post(rtLogin, requestData, {
			headers: {
				'Content-Type': 'application/json'
			}
		});
		// console.log(data)
		console.log('a',data[0])
		if (data[0].RESULTADO === '0') {
			setMessageLogin(data[0].MSG)
		} else {
			setMessageLogin('Acceso correcto')
			const authData = JSON.stringify(data[0]);
			setCookie('authVIACT', authData, 1);
			navigate("/admin");
		}
	}

	useEffect(() => {
		if (cookieExists('authVIACT')) {
			const localuser = JSON.parse(getCookie('authVIACT'));
			if (localuser.IDUSUARIO && localuser.CONTRA) {
				async function consultUser() {
					var requestData = {
						params: {
							USUARIO: localuser.IDUSUARIO,
							CONTRA: localuser.CONTRA,
							cookieAccess: true
						}
					};
					const { data } = await axios.post(rtLogin, requestData, {
						headers: {
							'Content-Type': 'application/json'
						}
					});
					if (data[0].RESULTADO == '1') {
						navigate("/admin");
					}
				}
				consultUser()
			}
		}
	}, [])
	return (
		<div className="login-grid">
			<div className="login-cover admin">
				<div className="login-cover-brand">
					<div className="img">
						<img src={logo1} alt="VIACT" />
					</div>
				</div>
				<div className="login-cover-logo">
					<div className="mt-3">
						<h3 style={{fontWeight:700}}>VISIÓN INNOVADORA Y AVANCE POR EL CAMBIO TECNOLÓGICO</h3>
					</div>
				</div>
				<br />
			</div>
			<div className="login-control">
				<div className="card">
					<h4>Iniciar sesión</h4>
					<form onSubmit={(event) => handleSubmit(event)}>
						<div className="form-control">
							<label>Usuario</label>
							<input type="text" required onChange={(e) => setLogin({ ...login, idusuario: e.currentTarget.value })} />
						</div>
						<div className="form-control">
							<label>Contraseña</label>
							<input type="password" required onChange={(e) => setLogin({ ...login, password: e.currentTarget.value })} />
						</div>
						<button type="submit">Ingresar</button>
						<span style={{ color: 'red' }}>{messageLogin}</span>
					</form>
				</div>
				<br />
				<small>VIACT App v0.1</small>
			</div>
		</div>
	)
}