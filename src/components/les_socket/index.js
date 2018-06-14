import { h, Component } from 'preact';
import { Link } from 'preact-router/match';
import * as reqwest from 'reqwest';
import 'fontawesome';
import { Switch, Message } from 'element-react';
import 'element-theme-default';
import * as moment from 'moment';

import {Socket, Presence} from 'phoenix';

export default class LesSocket extends Component {
  constructor(props){
    super(props);
    const auth = props.auth;

    this.handleSetSocketOnline = this.handleSetSocketOnline.bind(this);
    this.handleSocketSuccess = this.handleSocketSuccess.bind(this);
    this.handleSocketError = this.handleSocketError.bind(this);
    this.handleStartSocket = this.handleStartSocket.bind(this);

    let socket = new Socket("ws://novo.letrassolidarias.com.br/socket", {params: {userToken: auth.user.token }});

    socket.connect();
    this.setState({presences: {}, auth: auth, socket: socket, online: false, connected: false, dashboard: null});
    this.handleStartSocket();
    this.handleStartDashboard = this.handleStartDashboard.bind(this);
    moment.locale('pt_br');
  }
  handleStartSocket(){
    let that = this;
    let socket = this.state.socket;
    socket.connect();
    socket.onOpen(this.handleSocketSuccess);
    socket.onError(this.handleSocketError);
    this.setState({socket: socket})

    let base  = socket.channel("base", {});
    base.join()
      .receive("ok", resp => {})
      .receive("error", resp => { });
    base.on("presence_state", state => {
      let presences = that.state.presences;
      presences = Presence.syncState(presences, state)
      that.setState({presences: presences});
      that.props.onLine({presences, socket});
    })

    base.on("presence_diff", diff => {
      let presences = that.state.presences;
      presences = Presence.syncDiff(presences, diff)
      that.setState({presences: presences});
      that.props.onLine({presences, socket});
    })
    this.handleStartDashboard();
  }
  handleStartDashboard(){
    if(this.state.auth){
      switch(this.state.auth.user.tipoconta){
        case "ADMINISTRADOR":
          let dashboard  = this.state.socket.channel("admin:dashboard", {});
          dashboard.join()
            .receive("ok", resp => {  })
            .receive("error", resp => { });

          dashboard.on("nova_redacao", resp => {
            Message({
              showClose: true,
              message: (<div>Foi enviada uma nova redação às {moment(resp.data).format("HH:mm")} de <b>{resp.redacao_nome}</b> (<a href="javascript://">#{resp.redacao_id}</a>)</div>),
              type: 'warning',
            });
          });

          dashboard.on("nova_revisao", resp => {
              let tag = null;
              switch(resp.obs){
                case "CASOZERO":
                  tag = (<div class="tag is-danger is-small">Caso Zero</div>);
                  break;
                case "FINALIZA":
                  tag = (<div class="tag is-success is-small">Finalizado</div>);
                  break;
                case "NOVA":
                  tag = (<div class="tag is-info is-small">Nova</div>);
                  break;
                case "SEMCONDICAO":
                  tag = (<div class="tag is-danger is-small">Sem condição</div>);
                  break;
                default:
                  tag = null;
                  break;
              }
              Message({
                showClose: true,
                message: (<div>Uma revisão {tag} foi registrada às {moment(resp.data).format("HH:mm")} de <b>{resp.revisor_nome}</b> (<a href="javascript://">#{resp.revisao_id} </a>) </div>),
                type: 'warning',
              });
          });
          this.setState({dashboard: dashboard});
          break;
        default:
        break;
      }
    }



  }

  handleSetSocketOnline(ev){
    let that = this;
   if(this.state.connected){
    if(this.state.online)
    {
      /*Message({
        showClose: true,
        message: (<div> Deixando OFFLINE.</div>),
        type: 'warning',
      });*/
      channel = that.state.dashboard;
      channel.leave().receive("ok", () =>{
        that.setState({online: false})
      })

    }else{
      /*Message({
        showClose: true,
        message: (<div> Deixando ONLINE.</div>),
        type: 'warning',
      });*/
      this.setState({online: true});

    }
   }else{
     this.setState({online: false});
   }
  }
  handleSocketSuccess(ev){
   this.setState({connected: true, online: true});

  /* Message({
            showClose: true,
            message: (<div> Você agora está ONLINE.</div>),
            type: 'success',
          });*/
  }
  handleSocketError(ev){
    this.setState({connected: false, online: false});
      /*Message({
            showClose: true,
            message: (<div> Você está OFFLINE.</div>),
            type: 'error',
          });*/
  }
  render() {
    return (
        <Switch value={this.state.online && this.state.conected} onText="ON" offText="OFF" onColor="#13ce66" offColor="#ff4949" onChange={this.handleSetSocketOnline}></Switch>
    );
  }
}
