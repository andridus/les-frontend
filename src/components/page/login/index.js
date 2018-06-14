import { h, Component } from 'preact';
import * as reqwest from 'reqwest';
import Loading from '../../loading';
import * as is from 'is_js';
import root from 'window-or-global';
import letras from '../../../images/letras.png';
import bg from '../../../images/bg.png';
import { Message, MessageBox } from 'element-react';
import 'element-theme-default';
export default class LoginPage extends Component {
  constructor(props){
    super(props);
    this.state = { url: root.url_base+'/api/session/login', 
                   username: '', 
                   password: '', 
                   remember_me: false, 
                   loading: false,
                   erros: null};
    this.handleUpdateUsername = this.handleUpdateUsername.bind(this);
    this.handleUpdatePassword = this.handleUpdatePassword.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(ev){
    ev.preventDefault();
    let err = [];
    if(is.empty(this.state.username)){
      err.push(<li><i> O campo <b>Usuário</b> não pode ficar vazio.</i></li>);
    }
    if(is.empty(this.state.password)){
      err.push(<li><i> O campo <b>Senha</b> não pode ficar vazio.</i></li>);
    }
    if(this.state.password.length < 4){
      err.push(<li><i>O campo <b>Senha</b> não pode ter menos de 4 caracteres.</i></li>);
    }
    if(!is.empty(err)){
      this.setState({erros: err})
      MessageBox.msgbox({
        title: 'Erro. Revise os dados',
        message: (<p>{err}</p>),
        showCancelButton: false,
        confirmButtonText: 'OK',
      }).then(action => {
      });
    }else{
      const that = this;
      that.setState({loading: true});
      reqwest({
          url: this.state.url
        , type: 'json'
        , method: 'post'
        , crossOrigin: true
        , data: { username: this.state.username
                , password: this.state.password
                , remember: this.state.remember_me
               }
        })
      .then(function (resp) {
        that.setState({loading: false});
          Message({
            showClose: true,
            message: (<p>
              Bem vindo {resp.user.tipoconta} <b> {resp.user.username} </b>.
            </p>),
            type: 'warning'
          })
        that.props.logged(resp)
        })
      .fail(function (err, msg) {
        that.setState({loading: false});
          Message({
            showClose: true,
            message: (<p>
              Erro ao tentar entrar. Suas credenciais são inválidas...
            </p>),
            type: 'warning'
          })
        that.setState({password: ''});
        });

    }
  }

  handleUpdateUsername(ev){
    const username = ev.target.value;
    this.setState({username: username});
  }

  handleUpdatePassword(ev){
    const password = ev.target.value;
    this.setState({password: password});

  }
  componentDidMount(){
    let html = document.querySelector('html');
    html.style.backgroundColor = '#fffcf6';
    html.style.backgroundImage = `url(${bg})`;
  }
  componentWillUnmount() {
    let html = document.querySelector('html');
    html.style.backgroundColor = '#fffcf6';
    html.style.backgroundImage = 'url()';
  }
  
  render() {
    return (
      <div class="container is-fluid back-login">
        {
          this.state.loading && <Loading fullscreen={true} text="Aguarde. Estamos verificando suas crendenciais!" />
        }
        <div class="login-wraper columns" style="margin-top:15px;">
          <div class="column">
            <div class="container">
                <div class="box-login" style="text-align: center">
                  <img src={letras} />
                  <p class="subtitle is-size-6"> Revisando textos, construindo sonhos.</p>
                  <form class="login-form" onSubmit={this.handleSubmit} method="post">
                    <input type="hidden" name="_csrf_token" value="" />
                    <b> Faça o seu acesso: </b>
                    <p class="control has-icon has-icon-right">

                      <input type="text" class="input email-input" name="username" placeholder="Seu login" value={this.state.username} onInput={this.handleUpdateUsername}/>
                      <span class="icon user">
                        <i class="fa fa-user"></i>
                      </span>
                    </p>
                    <p class="control has-icon has-icon-right" style="margin-top:5px">
                      <input type="password" class="input password-input" name="password" placeholder="Sua Senha" value={this.state.password} onInput={this.handleUpdatePassword}/>
                      <span class="icon lock">
                        <i class="fa fa-lock"></i>
                      </span>
                    </p>
                    <br />
                    <p class="control login">
                      <input type="submit" class="login-button button is-success is-outlined is-large is-fullwidth" value="Entrar" />
                    </p>
                  </form>
                </div>
              </div>
            </div>
        </div>
      </div>
    );
  }
}
