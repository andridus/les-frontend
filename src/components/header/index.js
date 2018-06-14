import { h, Component } from 'preact';
import { Link } from 'preact-router/match';
import * as reqwest from 'reqwest';
import 'fontawesome';
import LesSocket from '../les_socket'
import { Message} from 'element-react';
import 'element-theme-default';
import root from 'window-or-global';
import letras from '../../images/letras.png';

export default class Header extends Component {
	constructor(props){
    super(props);

		this.setState({menuItems:[], auth: this.props.auth, opened: false});

  }


	componentWillReceiveProps(props) { ///////////// QUANDO O COMPONENTE FOR MONTADO
    let menuItems = [];
    if(props.auth && (!this.state.auth || this.state.auth.user.tipoconta != props.auth.user.tipoconta)){
				this.setState({auth: props.auth})
		  	switch(props.auth.user.tipoconta) {
			  	case 'ADMINISTRADOR':
			  		menuItems = [
						    {label: 'Temas', icon: 'fa fa-newspaper', link: '/admin/temas', subitems: []},
						    {label: 'Revisores', icon: 'fa fa-copy', link: '/admin/revisores', subitems: []},
						    {label: 'Revisões', icon: 'fa fa-file-alt', link: '/admin/revisoes', subitems: [
						      {label: 'Pendentes', icon: '', link: '/admin/revisoes-pendentes'},
						    ]},
						    {label: 'Redações', icon: 'fa fa-file-alt', link: '/admin/redacoes', subitems: [
                  {label: 'Pendentes', icon: '', link: '/admin/redacoes-pendentes'},
						    ]},
						    {label: 'Usuários', icon: 'fa fa-users', link: '/admin/usuarios', subitems: [
						      {label: 'Novos', icon: '', link: '/admins/usuarios-pendentes'}
						    ]}
						  ];
						this.setState({menuItems:menuItems, auth: props.auth})
						break;
          case 'GESTOR':
            menuItems = [

                {label: 'Enviar Redações', icon: 'fa fa-copy', link: '/gestor/enviar-redacoes', subitems: []},
                {label: 'Temas', icon: 'fa fa-newspaper', link: '/gestor/temas', subitems: []}
              ];
            this.setState({menuItems:menuItems, auth: props.auth})
            break;
          case 'GESTOR DE REDACOES':
            menuItems = [

                {label: 'Enviar Redações', icon: 'fa fa-copy', link: '/gestor_de_redacoes/enviar-redacoes', subitems: []},
                {label: 'Temas', icon: 'fa fa-newspaper', link: '/gestor_de_redacoes/temas', subitems: []}
              ];
            this.setState({menuItems:menuItems, auth: props.auth})
            break;
          case 'REVISOR':
            menuItems = [
                {label: (<b>...</b>), icon: '', link: 'javascript://', subitems: []},
                {label: 'Revisar uma redação', icon: 'fa fa-pencil-alt', link: '/revisor/revisar-uma-redacao', subitems: []},
                {label: 'Minhas Revisões', icon: 'fa fa-copy', link: '/revisor/minhas-revisoes', subitems: []},
                {label: 'Temas', icon: 'fa fa-newspaper', link: '/revisor/temas', subitems: []},
                {label: 'Banco de Redações', icon: 'fa fa-copy', link: '/revisor/banco-de-redacoes', subitems: []},
              ];
            this.setState({menuItems:menuItems, auth: props.auth});
						let that = this;
						reqwest({
		          url: root.url_base+'/api/revisor/minhas-revisoes-nesta-semana/'
		          , method: 'post'
		          , headers: {
		            'Authorization':'Bearer '+props.auth.jwt
		          }
		          , data: {obsadmrevisoes: ''}
		          , success: function (resp) {
									let revisoes = "Nenhuma revisão esta semana"
									if(resp.revisoes){
										if(resp.revisoes == 1){
											revisoes = "1 revisão esta semana"
										}else{
											revisoes = resp.revisoes +" revisões esta semana"
										}
									}
									let menuItems = [
			                {label: (<b>{revisoes}</b>), icon: '', link: 'javascript://', subitems: []},
			                {label: 'Revisar uma redação', icon: 'fa fa-pencil-alt', link: '/revisor/revisar-uma-redacao', subitems: []},
			                {label: 'Minhas Revisões', icon: 'fa fa-copy', link: '/revisor/minhas-revisoes', subitems: []},
			                {label: 'Temas', icon: 'fa fa-newspaper', link: '/revisor/temas', subitems: []},
			                {label: 'Banco de Redações', icon: 'fa fa-copy', link: '/revisor/banco-de-redacoes', subitems: []},
			              ];
		            that.setState({menuItems:menuItems})
		          }
		          , error: function(){
		            Message({
		              type: 'error',
		              message: 'Não foi possível carregar suas revisões da semana.'
		            });
		          }
		        });
            break;
          case 'ESTUDANTE':
            menuItems = [
                {label: 'Enviar Redação', icon: 'fa fa-file', link: '/estudante/enviar-redacao', subitems: []},
                {label: 'Temas', icon: 'fa fa-newspaper', link: '/estudante/temas', subitems: []},
                {label: 'Minhas Redações', icon: 'fa fa-server', link: '/estudante/minhas-redacoes', subitems: []},
              ];
            this.setState({menuItems:menuItems, auth: props.auth})
            break;

					default:
						this.setState({menuItems:[], auth: props.auth})
			  }
		  }
    ///////////////////////// CARREGA MENU DEPENDENDO DO LGIN DO USUARIO //////////////////////////
    const url = 'http://api.tvmaze.com/search/shows?q=';
 /*   reqwest({
        url: url
      , type: 'post'
      })
    .then(function (resp) {
        console.log(resp);
      })
    .fail(function (err, msg) {
        console.log('ERROR!');
      })
    .always(function (resp) {
      console.log('SEMPRE');
      });*/

    ////////////////////////// END CARREGA MENU ////////////////////////////////////////



    ////////////////////// NAVBURGUER /////////////////////////////////////////////////

    /////////////////////////// END NAVBURGUER //////////////////////////////////////
  } ///////////// FIM DE QUANDO O COMPONENT FOR MONTADO

	handleToggleMenu(){
		this.setState({opened: !this.state.opened })

	}
	handleCloseMenu(){
    this.setState({opened: false })
    
	}
	handleOnline(onlines){
		this.props.onLine(onlines)

	}

	render() {
		const menuItems = this.state.menuItems;
		const auth = this.props.auth;
    const logoImg = letras;
    const logoAlt = 'Bulma: a modern CSS framework based on Flexbox';
    const userImg = 'https://www.samservicos.com.br/wp-content/uploads/2015/11/sem-imagem-avatar.png';
    let active = this.state.opened ? "is-active" : ""
    return auth ? (
      <nav class="navbar" role="navigation" aria-label="main navigation" style="z-index:500;">
      
        <div class="navbar-brand">
          <Link class="navbar-item" href="/" onClick={this.handleCloseMenu.bind(this)}>
          	<img src={logoImg} alt={logoAlt} width="112" height="28" />
        	</Link>
        	<div style="margin-top: 10px; margin-left: 10px;">
        		<LesSocket auth={auth} onLine={this.handleOnline.bind(this)}/>
        	</div>
          <a role="button" class={"navbar-burger "+active} aria-label="menu" aria-expanded="false" onClick={this.handleToggleMenu.bind(this)}>
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
          </a>
        </div>

        <div class={"navbar-menu "+active} id="navbarMainMenu">
        	<div class="navbar-start">

        	</div>
          <div class="navbar-end">


            {
              menuItems.map(item => {
                if ( item.subitems.length )
                  return (
                    <div class="navbar-item has-dropdown is-hoverable">
                      <Link class="navbar-link" href={item.link} onClick={this.handleCloseMenu.bind(this)}>
                        <i class={item.icon} />
                        <span class="label-main-menu"> {item.label} </span>
                      </Link>
                      <div class="navbar-dropdown is-boxed is-right">
                        {(item.subitems.map(subitem => {
                          return (
                          	<Link class="navbar-item" href={subitem.link} onClick={this.handleCloseMenu.bind(this)}>
	                          	<i class={subitem.icon} />
	                          	<span class="label-main-menu"> {subitem.label}</span>
                          	</Link>
                            );
                          })
                        )}
                      </div>
                    </div>
                  );
                else return (
                  <Link class="navbar-item" href={item.link} onClick={this.handleCloseMenu.bind(this)}>
                  	<i class={item.icon} />
                  	<span class="label-main-menu"> {item.label}</span>
                	</Link>
                );
              })
            }


            <div class="navbar-item has-dropdown is-hoverable">
            	<Link class="navbar-item" href="javascript://">
              	<img src={userImg} class="user-main-menu" />
            	</Link>
              <div class="navbar-dropdown is-boxed is-right">
                <b class="navbar-item">
                  <span class="label-main-menu"> {this.state.auth.user.username} </span>
                </b>
                <div class="navbar-item" style="font-size:10px; margin-top:-15px; width:100%;">
                  <i>({this.state.auth.user.tipoconta.toUpperCase()})</i>
                </div>
                <Link class="navbar-item" href="/sair" onClick={this.handleCloseMenu.bind(this)}>
	              	<i class="" />
                  <span class="label-main-menu"> Sair </span>
	            	</Link>
              </div>
            </div>



          </div>
        </div>
      </nav>
    ) : null;
  }
}
