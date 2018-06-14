import { h, Component } from 'preact';
import * as reqwest from 'reqwest'
import { route } from 'preact-router';
import root from 'window-or-global';
import { Loading, MessageBox } from 'element-react';
export default class RevisorRevisarUmaRedacao extends Component {
    constructor(props){
        super(props);
    }
    componentWillReceiveProps(props) { ///////////// QUANDO O COMPONENTE FOR MONTADO
        this.setState({auth: props.auth})
        this.load_revisao();
      }
      load_revisao(){
        let that = this;
        if(this.state.auth){
          reqwest({
            url: root.url_base+'/api/revisor/revisao-aleatoria'
            , method: 'post'
            , headers: {
              'Authorization':'Bearer '+this.state.auth.jwt
            }
            , data: {}
            , success: function (resp) {
              route('/revisor/revisar/'+resp.id)
            }
            , error: function(){
                MessageBox.confirm(
                  <div>
                      <p>
                        Não foi possível lhe entregar uma redação para revisar, pedimos que vá diretamente ao banco de redações e selecione uma de sua escolha.
                      </p>
                </div>, 'Erro ao resolver a redação!', {
                confirmButtonText: 'Certo.',
                showCancelButton: false,
                type: 'error'
              }).then(() => {
                route("/revisor/banco-de-redacoes", false);
              }).catch(()=>{route("/revisor/banco-de-redacoes", false); })
            }
          });
        }
      }
    render(){
        return (<section class="section">
          <Loading fullscreen={true} text="Aguarde. Estamos localizando uma redação para você revisar..." />
        </section>)
    }
}
