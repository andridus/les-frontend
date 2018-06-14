import { h, Component, render } from 'preact';
import { Router, route, Route } from 'preact-router';
import root from 'window-or-global';

import * as reqwest from 'reqwest';
import 'element-theme-default';
import { Message, MessageBox } from 'element-react';
import * as store from 'store';
import * as expirePlugin from 'store/plugins/expire';



import Header from './header';

import LoginPage from './page/login';


import Error401 from './page/error401';
import Error404 from './page/error404';

///LOADING ROTAS DO ADMINISTRADOR
import AdminHome from './states/admin/home';
import AdminUsuariosPendentes from './states/admin/usuarios_pendentes';
import AdminUsuarios from './states/admin/usuarios';
import AdminRevisoesPendentes from './states/admin/revisoes_pendentes'
import AdminRevisoes from './states/admin/revisoes';
import AdminRedacoesPendentes from './states/admin/redacoes_pendentes';
import AdminRedacoes from './states/admin/redacoes';
import AdminRevisores from './states/admin/revisores';
import AdminTemas from './states/admin/temas';
import AdminVisualizarRevisao from './states/admin/visualizar_revisao';

//LOADING ROTAS DO GESTOR
import GestorHome from './states/gestor/home';
import GestorEnviarRedacoes from './states/gestor/enviar_redacoes';
import GestorTemas from './states/gestor/temas';

//LOADING ROTAS DO GESTOR DE REDAÇÕES
import GestorRedHome from './states/gestor_de_redacoes/home';
import GestorRedEnviarRedacoes from './states/gestor_de_redacoes/enviar_redacoes';
import GestorRedTemas from './states/gestor_de_redacoes/temas';

//LOADING ROTAS DO REVISOR
import RevisorHome from './states/revisor/home';
import RevisorMinhasRevisoes from './states/revisor/minhas_revisoes';
import RevisorMeuHistorico from './states/revisor/meu_historico';
import RevisorBancoDeRedacoes from './states/revisor/banco_de_redacoes';
import RevisorTemas from './states/revisor/temas';
import RevisorRevisar from './states/revisor/revisar';
import RevisorRevisarUmaRedacao from './states/revisor/revisar_uma_redacao';


//LOADING ROTAS DO ESTUDANTE
import EstudanteHome from './states/estudante/home';
import EstudanteEnviarRedacao from './states/estudante/enviar_redacao';
import EstudanteMinhasRedacoes from './states/estudante/minhas_redacoes';
import EstudanteTemas from './states/estudante/temas';
import Home from '../routes/home';
// import Home from 'async!../routes/home';
// import Profile from 'async!../routes/profile';

if (module.hot) {
	require('preact/debug');
}

root.url_base = "http://novo.letrassolidarias.com.br";
store.addPlugin(expirePlugin);

export default class App extends Component {
	/** Gets fired when the route changes.
	 *	@param {Object} event		"change" event from [preact-router](http://git.io/preact-router)
	 *	@param {string} event.url	The newly routed URL
	 */

	constructor(props){
		super(props);
		root.messages = {};
		this.setState({messages: []})
		this.verifica_logado.bind(this);
		
	}
	

	clear() {
		this.messages.clear();
	}
	componentDidMount(){
		//this.verifica_logado();
		let that= this;
		/*setInterval(function(){
			that.verifica_logado();
		},5000)*/
	}
	componentWillMount(){
		let that = this;
		root.messages.callback = (data) => {
			let time = new Date();
			let timestamp = time.getTime();
			let message = {timestamp: timestamp+1000, message: data};
			let messages = that.state.messages;
			messages.push(message);
			that.setState({messages: messages});
			setTimeout(() =>{
				let time = new Date();
				let timestamp = time.getTime();
				let messages = that.state.messages.filter(m => {
					return m.timestamp > timestamp;
				})
				console.log("aerfsf")
				that.setState({ messages: messages });
			}, 2000)

		}
	}

	verifica_logado(){
		const auth1 = store.get('auth');
		if(auth1){
			reqwest({
					url: root.url_base+'/api/usuario/logado'
				, type: 'json'
				, method: 'get'
				, crossOrigin: true
				, headers: {
							'Authorization':'Bearer '+auth1.jwt
						}
				, data: { }
				})
				.then(function (resp) {

				})
				.fail(function (err, msg) {
						Message({
								showClose: true,
								message: 'Você foi desconectado do sistema Letras Solidárias.',
								type: 'info'
							});
						store.clearAll();
						that.setState({auth: null});
				});
		}
	}
	getInitialState(){
		return {counter: 0};
	}


	isAuthenticated() {
		//store.clearAll();
		const auth = store.get('auth');
		if(!this.state.auth){
			this.setState({auth: auth});
		}

		return (auth != undefined) && (auth != {});
	}

	async handleRoute(e) {
		let that = this;
		const auth1 = store.get('auth');

		this.setState({currentUrl: e.url, currentPath: e.current.attributes.path}) ;

		const isAuthed = await this.isAuthenticated();
		switch(e.url){
			case '/login':
				if(isAuthed) route('/', true);
			
				break;

			case '/sair':
				let that = this;
				reqwest({
          url:  root.url_base +'/api/session/sair'
        , type: 'json'
        , method: 'get'
        , crossOrigin: true

        , data: { }
        })
	      .then(function (resp) {
	         Message({
	            showClose: true,
	            message: 'Você saiu do sistema Letras Solidárias.',
	            type: 'info'
	          });
		      store.clearAll();
					if(that.state.socket){
						that.state.socket.channels.map( c =>{
							c.leave();
						})
					}
		      that.setState({auth: null});
					route('/', true);
				})
	      .fail(function (err, msg) {
	          Message({
	            showClose: true,
	            message: 'Erro ao tentar sair. Tente novamente.',
	            type: 'error'
	          });
        });

				break;

			default:
				if(!isAuthed){
					route('/login', true);

				}else{
					let prefix0 = e.url.split("/");
					let prefix = "";
					let auth = store.get('auth');
					if(prefix0.length > 1)
					{

						prefix = prefix0[1];
						switch(prefix.toUpperCase()){
						case "ADMIN":
							if(auth.user.tipoconta != "ADMINISTRADOR"){
								route('/nao-autorizado', true);
							}

							break;
						case "ESTUDANTE":

							if(auth.user.tipoconta != "ESTUDANTE"){
								route('/nao-autorizado', true);
							}else{
								if(e.url=="/")
								{
									route('/estudante', true);
								}
							}
							break;
						case "GESTOR":
							if(auth.user.tipoconta != "GESTOR"){
								route('/nao-autorizado', true);
							}else{
								if(e.url=="/")
								{
									route('/gestor', true);
								}
							}
							break;
						case "REVISOR":
							if(auth.user.tipoconta != "REVISOR"){
								route('/nao-autorizado', true);
							}else{
								if(e.url=="/")
								{
									route('/revisor', true);
								}
							}
							break;
						default:
							break;

						}
					}

					if(e.url == "/"){
						switch(auth.user.tipoconta){
							case "ADMINISTRADOR":
								route('/admin', true);
								break;
							case "ESTUDANTE":
								route('/estudante', true);
								break;
							case "REVISOR":
								route('/revisor', true);
								break;
							default:
								route('/', true);
						}
					}

				}
				break;
		}
	}


	handleUpdateLogin(e){

		this.setState({auth: e});
		store.set('auth', e, e.exp*1000);
		switch(e.user.tipoconta){
			case "ADMINISTRADOR":
				route('/admin', true);
				break;
			case "ESTUDANTE":
				route('/estudante', true);
				break;
			default:
				route('/', true);
		}


	}
	handleOnline({presences, socket}){
		this.setState({onlines: presences, socket: socket})
	}


	render () {
		let tipoconta = "NONE";
		if(this.state.auth){
			tipoconta = this.state.auth.user.tipoconta;
		}

		return (
			<div id="app">
				<div id="messages">
					{this.state.messages.map(m=>{
						return (<div class="mess"><div class="close " onClick={(e)=>{
							let messages = this.state.messages.filter(m1 => {
								return m1 != m;
							})
							this.setState({messages: messages});

						}}>
						<i class="fa fa-times"></i></div>{m.message}</div>)
					})}
				</div>
				
				<link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.0.13/css/all.css" crossorigin="anonymous" />
				<Header auth={this.state.auth} onLine={this.handleOnline.bind(this)}/>
				<Router onChange={this.handleRoute.bind(this)}>
					<Home path="/" />
					<Error401 path="/nao-autorizado" />
					<LoginPage path="/login" logged={this.handleUpdateLogin.bind(this)}/>
					<Home path="/sair" />


				{/* ROTAS PARA ADMINISTRADOR */}
					<AdminHome path="/admin" auth={this.state.auth} onlines={this.state.onlines}/>
					<AdminUsuariosPendentes auth={this.state.auth} path="/admin/usuarios-pendentes" />
					<AdminUsuarios auth={this.state.auth} path="/admin/usuarios" />
					<AdminRevisoesPendentes auth={this.state.auth} path="/admin/revisoes-pendentes" />
					<AdminRevisoes auth={this.state.auth} path="/admin/revisoes" />
					<AdminRedacoesPendentes auth={this.state.auth} path="/admin/redacoes-pendentes" />
					<AdminRedacoes auth={this.state.auth} path="/admin/redacoes" />
					<AdminRevisores auth={this.state.auth} path="/admin/revisores" />
					<AdminTemas auth={this.state.auth} path="/admin/temas" />
					<AdminVisualizarRevisao auth={this.state.auth} path="/admin/revisao/:id/visualizar" />
					<Home path="/admin/revisor/:id" />
					<Home path="/admin/estudante/:id" />

				{/* ROTAS PARA GESTOR*/}
					<GestorHome auth={this.state.auth} path="/gestor" />
					<GestorEnviarRedacoes auth={this.state.auth} path="/gestor/enviar-redacoes" />
					<GestorTemas auth={this.state.auth} path="/gestor/temas" />

				{/* ROTAS PARA GESTOR*/}
					<GestorRedHome auth={this.state.auth} path="/gestor_de_redacoes" />
					<GestorRedEnviarRedacoes auth={this.state.auth} path="/gestor_de_redacoes/enviar-redacoes" />
					<GestorRedTemas auth={this.state.auth} path="/gestor_de_redacoes/temas" />

				{/* ROTAS PARA REVISOR*/}
					<RevisorHome auth={this.state.auth} path="/revisor" />
					<RevisorMinhasRevisoes auth={this.state.auth} path="/revisor/minhas-revisoes" />
					<RevisorMeuHistorico auth={this.state.auth} path="/revisor/meu-historico" />
					<RevisorBancoDeRedacoes auth={this.state.auth} path="/revisor/banco-de-redacoes" />
					<RevisorTemas auth={this.state.auth} path="/revisor/temas" />
					<RevisorRevisar auth={this.state.auth} path="/revisor/revisar/:id" />
					<RevisorRevisar auth={this.state.auth} path="/revisor/revisar/:id" />
					<RevisorRevisarUmaRedacao auth={this.state.auth} path="/revisor/revisar-uma-redacao" />

				{/* ROTAS PARA ESTUDANTE*/}
					<EstudanteHome auth={this.state.auth} path="/estudante" />
					<EstudanteEnviarRedacao auth={this.state.auth} path="/estudante/enviar-redacao" />
					<EstudanteEnviarRedacao auth={this.state.auth} path="/estudante/enviar-redacao/:tema"/>
					<EstudanteMinhasRedacoes auth={this.state.auth} path="/estudante/minhas-redacoes" />
					<EstudanteTemas auth={this.state.auth} path="/estudante/temas" />


					<Error404 default />
				</Router>
				<div id="elm-revisor" />
			</div>
		);
	}
}
