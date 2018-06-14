import { h, Component } from 'preact';
import { Link } from 'preact-router/match';
import * as reqwest from 'reqwest';
import 'fontawesome';
import { Loading, Select, DateRangePicker, i18n} from 'element-react';
import locale from 'element-react/src/locale/lang/pt-br'
import * as moment from 'moment';
import 'element-theme-default';
import style from './style';

class LesTableColumn extends Component {
}

class LesTableQueryOpt extends Component {
}

class LesTableButton extends Component {
}


class LesTable extends Component {
  constructor(props){
    super(props);
    let search_order = {};
    if(props.order){
      let o = {};
      Object.keys(props.order).map( k =>{
        o["order$"+k] = props.order[k]
      })
      search_order = o;
    }
    this.setState({ url: props.url
                  , loading: false
                  , showing: 30
                  , opts_showing: [10,30,50,120,150]
                  , columns: []
                  , buttons: []
                  , current_page: 1
                  , pages: []
                  , count_pages: 0
                  , items: []
                  , search_query: {}
                  , search_order: search_order
                  , count: 0});
    this.handleGetItems = this.handleGetItems.bind(this);
    this.handleFormatingData = this.handleFormatingData.bind(this);
    this.handlePopulateColumns = this.handlePopulateColumns.bind(this);
    this.selection_render = this.selection_render.bind(this);
    i18n.use(locale);


  }
  componentWillReceiveProps(props) { ///////////// QUANDO O COMPONENTE FOR MONTADO
    let search_order = this.state.search_order;

    if(props.order_id == "asc"){
      search_order["order$id"] = "asc";
    }else if(props.order_id == "desc"){
      search_order["order$id"] = "desc";
    }
    if(!this.state.auth && props.auth){
      this.setState({auth: props.auth, url: props.url, search_order: search_order});
      this.handleGetItems();
    }
    if(props.update && props.update != this.state.update){
      this.handleGetItems();
      this.setState({ update: props.update});
    }
    this.handlePopulateColumns(props);

  }

  handlePopulateColumns(props){
    let columns = props.children.filter( x => {
      return x.attributes['type'] == 'column';
    })

    let maped_columns = columns.map( x => {
      let query_opts = x.children.filter( x => {
        return x.attributes['type'] == 'filter';
      });
      let maped_query_opts = query_opts.map( x => {
        return {label: x.attributes.label, value: x.attributes.value }
      });
      return {  column: x.attributes.column
              , label: x.attributes.label
              , apply: x.attributes.apply
              , tooltip: x.attributes.tooltip
              , search_type: x.attributes.search_type
              , query_opts: maped_query_opts
             }
    })
    let buttons = props.children.filter( x => {
      return x.attributes['type'] == 'button';
    })
    let maped_buttons = buttons.map( x => {
      return {  type: x.attributes.type
              , label: x.attributes.label
              , onClick: x.attributes.onClick
              , classe: x.attributes.classe
              , icon: x.attributes.icon
              , title: x.attributes.title
              , only_column: x.attributes.only_column
              , only_values: x.attributes.only_values
             }
    })
    this.setState({columns: maped_columns, buttons: maped_buttons});

  }
  handleGetItems(){
    let that = this;
    let search_query = that.state.search_query;
    let search_order = that.state.search_order;
    let $data = Object.assign(search_query, search_order);
    let cp = that.state.current_page == 0 ? 1 :  that.state.current_page
    $data.$limit = that.state.showing;
    $data.$offset = (cp-1)*$data.$limit;
    that.setState({loading: true});
    reqwest({
        url: this.state.url
      , type: 'json'
      , method: 'post'
      , headers: {
        'Authorization':'Bearer '+this.state.auth.jwt
      }
      , crossOrigin: true
      , data: $data
      })
    .then(function (resp) {
        that.handleFormatingData(resp)
      })
    .fail(function (err, msg) {
        that.setState({loading: false});
    });

  }
  handleFormatingData(resp){
    let items = resp.items;
    let count = resp.count;
    let count_pages = Math.ceil(count/this.state.showing)
    let current_page = this.state.current_page;
    if(current_page > count_pages)
      current_page = count_pages;

    let pages = this.handleGeneratePages(current_page, count_pages)
    this.setState({ loading: false
                  , items: items
                  , count: count
                  , count_pages: count_pages
                  , current_page: current_page
                  , pages: pages
                });
  }
  handleGeneratePages(current_page, pages){
    let pages_ = [];
    let qtd_buttons = 5;
    let cycle = Math.ceil(pages/qtd_buttons);
    let position_in_cycle = Math.ceil(current_page/qtd_buttons);
    let first_page_in_cycle = position_in_cycle*qtd_buttons - qtd_buttons+1;
    first_page_in_cycle =  first_page_in_cycle<0 ? 1 : first_page_in_cycle;
    if(position_in_cycle < cycle){
      if(position_in_cycle!=1)
      {
        pages_.push({value: 'P', label:"Anterior"})
      }

      for(
        let i=(first_page_in_cycle);
        i < (first_page_in_cycle+qtd_buttons);
        i++
        ){

        pages_.push({
            value: i
          , label: i
        })

      }

      pages_.push({value: 'N', label:"Próximo"})

    }else{
      if(position_in_cycle!=1)
      {
        pages_.push({value: 'P', label:"Anterior"})
      }
      let last_page_in_cycle = pages;
      for(
        let i=(first_page_in_cycle);
        i <= last_page_in_cycle;
        i++
        ){

        pages_.push({
            value: i
          , label: i
        })

      }
    }
    return pages_;

  }
  handleUpdateShowing(val){
    let showing = val;
    this.setState({showing: showing});
    this.handleGetItems();
  }
  handleUpdateSearchQuery(ev){
    let search_query = this.state.search_query;
    search_query[ev.target.name] = ev.target.value;
    this.setState({search_query: search_query});
    this.handleGetItems();
  }
  handleUpdateSearchOrder(ev){
    let search_order = this.state.search_order;
    let name = ev.target.attributes.name.value;
    search_order[name] = search_order[name] ? (search_order[name] == "asc" ? "desc" : null) : "asc";
    this.setState({search_order: search_order});
    this.handleGetItems();

  }
  formPrevent(e){
    e.preventDefault();
  }

  componentDidMount(){
    console.log("MONTADO", this.state)

  }
  handleSetCurrentPage(ev){
    let val0 = ev.target.value;
    let val = 0;
    if(val0 == 'N'){
      let last_page = this.state.pages[this.state.pages.length - 2 ];
      val = last_page.value+1;
    }else if(val0 == 'P'){
      let first_page = this.state.pages[1];
      val = first_page.value-1;


    }else{
      val = val0;
    }
    let pages = this.handleGeneratePages(val, this.state.count_pages);
    this.setState({pages: pages, current_page: parseInt(val)})
    this.handleGetItems();

  }
  setOnSearch(){

    this.setState({searching: !this.state.searching})
  }
  splitDate(date){
    if(date!= undefined && date!= null){
      let dt = date.split("<=>");
      let res = ["",""];
        if(dt != null){
          res = [moment(dt[0],"YYYY-MM-DD HH:mm:ss").toDate(), moment(dt[1],"YYYY-MM-DD HH:mm:ss").toDate() ];
        }
      return res;
    }else{
      return ["",""];
    }

  }

  selection_render(selections){
    let state  = this.state;
    let has_selection = state.buttons.filter( b => {return b.type=="selection"} );
    if(has_selection.length){
      let selection_button = selections.length ? (
      <div class="button is-dark is-small" onClick={ ev => {
            let items = this.state.items.map( i => {
              i.selected = false;
              return i;
            })
            this.setState({items: items})
          }}>
        <i class="far fa-check-square np"></i>
      </div>) : (
      <div class="button is-light is-small" onClick={ev => {

            let items = this.state.items.map( i => {
              i.selected = true;
              return i;
            })
            this.setState({items: items})
          }}>
        <i class="far fa-square np"></i>
      </div>)

    return (<div class="field has-addons">
      <p class="control">
        {selection_button}
      </p>
      {state.buttons.map( button => {
          if(button.type == "button_all" && selections.length)
          {
            return (<p class="control"><div class={button.classe} title={button.title} onClick={(ev => {
              let items = state.items.filter( i => {
                return i.selected == true;
              })
              button.onClick(items);
            })}><i class={button.icon}></i></div></p>)
          }

        })}
    </div>)
  }else{
    return null;
  }

  }

  render() {
    let state = this.state;
    let selections = state.items.filter( it => {return it.selected} );

    let count = "nenhum registro";
    if(this.state.count && this.state.count!=0){
      if(this.state.count>0)
        count = this.state.count + " registros";
      else
        count = this.state.count + " registro";
    }
    let keys = [];
    let it = {};
    if(this.state.items.length)
      {
        keys = Object.keys(this.state.items[0]);
      }
    let searching_style = this.state.searching ? "is-dark" : " is-success";
    return (
        <div>
          {
            state.loading && <Loading fullscreen={true} text="Aguarde. Carregando dados..." />
          }
          <form onSubmit={this.formPrevent}>
            <div class="field is-horizontal">
              <div class="control">
                <button class={"button "+searching_style} type="submit" onClick={this.setOnSearch.bind(this)} title="Pesquisar nos campos">
                <i class="fa fa-search"></i> <span style="margin-left:5px">Filtros </span>
                </button>
              </div>
              <div class="control">
                <p class="button is-white is-small np">{count}</p>
                <p class="button is-white is-small np"><b>{state.count_pages} Páginas:</b> </p>
                {state.pages.map( page => {

                  let classe = (page.value == state.current_page) ? "button is-dark" : "button is-light";
                  return (<button class={classe} type="submit" onClick={this.handleSetCurrentPage.bind(this)} value={page.value}>{page.label}</button>)

                })}
              </div>
              <div class="control">
                <Select value={this.state.showing} onChange={this.handleUpdateShowing.bind(this)}>
                  {
                    state.opts_showing.map(x => {
                      return <Select.Option key={x} label={"Mostra " + x} value={x} />
                    })
                  }
                </Select>
              </div>
              { state.buttons.filter( b => {return b.type=="selection"} ).length ?
                <div class="control">
                  <p class="button is-white is-small np"><b>Selecionados:</b> </p>
                  <p class="button is-white is-small np">{state.items.filter( it => {return it.selected} ).length}</p>
                </div> : null
              }


            </div>
          </form>
          <table class="table is-striped is-bordered is-fullwidth">
            <thead>
              <tr>
                {state.columns.map( c => {
                  let search = c.query_opts.length ? (
                    <select name={"query$"+c.column} class="input is-dark is-small" value={state.search_query['query$'+c.column]} onChange={this.handleUpdateSearchQuery.bind(this)}>
                        <option value="">Todos</option>
                      {c.query_opts.map( q =>
                        (
                          <option value={q.value} > {q.label} </option>
                        )
                      )}
                    </select>
                    ) :

                  ( <input name={"query$"+c.column} type="text" class="input is-dark is-small" placeholder="Procure" onChange={this.handleUpdateSearchQuery.bind(this)} value={state.search_query['query$'+c.column]} />
                  )

                  search = c.search_type == "date" ? (
                    <div class={style.dpicker}><DateRangePicker value={this.splitDate(state.search_query['query$'+c.column])}
                      placeholder="Selecione a data" ref={e=>this.daterangepicker2 = e}
                      onChange={ date => {
                        let search_query = this.state.search_query;
                        if(date !=null)
                        {
                          search_query["query$"+c.column] = moment(date[0]).format("YYYY-MM-DD HH:mm:ss") + "<=>" + moment(date[1]).format("YYYY-MM-DD HH:mm:ss") ;

                        }else{
                          search_query["query$"+c.column] = null;
                        }

                          this.setState({search_query: search_query});
                          this.handleGetItems();

                      }}
                     align="right" shortcuts={[{
                        text: 'Última semana',
                        onClick: () => {
                          const end = new Date();
                          const start = new Date();
                          start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);

                          let search_query = this.state.search_query;
                          search_query["query$"+c.column] = moment(start).format("YYYY-MM-DD HH:mm:ss") + "<=>" + moment(end).format("YYYY-MM-DD HH:mm:ss");
                          this.setState({search_query: search_query});
                          this.handleGetItems();
                        }
                      }, {
                        text: 'Último  Mês',
                        onClick: () => {
                          const end = new Date();
                          const start = new Date();
                          start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);

                          let search_query = this.state.search_query;
                          search_query["query$"+c.column] = moment(start).format("YYYY-MM-DD HH:mm:ss") + "<=>" + moment(end).format("YYYY-MM-DD HH:mm:ss");
                          this.setState({search_query: search_query});
                          this.handleGetItems();
                        }
                      }, {
                        text: '3 últimos meses',
                        onClick: () => {
                          const end = new Date();
                          const start = new Date();
                          start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
                          let search_query = this.state.search_query;
                          search_query["query$"+c.column] = moment(start).format("YYYY-MM-DD HH:mm:ss") + "<=>" + moment(end).format("YYYY-MM-DD HH:mm:ss");
                          this.setState({search_query: search_query});
                          this.handleGetItems();
                        }
                      }]}
                      /></div> ) : search;

                  let order = state.search_order['order$'+c.column] ? ( state.search_order['order$'+c.column] == "desc" ? (<i class="fa fa-arrow-up" ></i>) : (<i class="fa fa-arrow-down" ></i>)) : null;
                  if(c.search_type == "off"){
                    return (
                     <th key={c.column+"_off"} >
                     <span name={"order$"+c.column}>{c.label}</span>
                     {order}
                     </th>
                    )

                  }else{
                    return (
                     <th key={c.column} >
                     <span onClick={this.handleUpdateSearchOrder.bind(this)} name={"order$"+c.column}>{c.label}</span>
                     {order}
                     {state.searching && search }
                     </th>
                    )
                  }

                })}
                {
                  state.buttons.length ?
                    <th>
                      {this.selection_render(selections)}

                    </th> : null
                }

              </tr>
            </thead>
            <tbody>
              {state.items.map( item => {
                let row_selected = item.selected ? "selected_row": "";
                return (
                  <tr key={item.id} class={row_selected}>
                    {state.columns.map( c => {
                          let value = item[c.column]
                          if(typeof c.apply == "function"){
                            value = c.apply(item[c.column], item);
                          }

                          return (
                           <td>{value}</td>
                          )
                        }
                      )
                    }
                    {
                      state.buttons.length ?
                          <td>
                            <div class="field has-addons">
                            {state.buttons.map( button => {
                              let selected = item.selected ? "fas fa-check-square np" :"far fa-square np"
                              let selected_parent = item.selected ? "button is-black is-small" :"button is-light is-small"
                              if(button.type == "button")
                              {

                                if(button.only_column){
                                  if(button.only_values.indexOf(item[button.only_column])!= -1){
                                    return (<p class="control"><div class={button.classe} title={button.title} onClick={(ev => {
                                      button.onClick(item);
                                    })}><i class={button.icon}></i></div></p>)
                                  }
                                }else{
                                  return (<p class="control"><div class={button.classe} title={button.title} onClick={(ev => {
                                    button.onClick(item);
                                  })}><i class={button.icon}></i></div></p>)
                                }

                              }else if(button.type == "selection")
                              {
                                return (<p class="control"><div class={selected_parent} onClick={(ev => {
                                  let items = this.state.items.map( i => {
                                    if(i == item){
                                      i.selected = !i.selected;
                                    }
                                    return i;
                                  })

                                  this.setState({items: items})

                                })}><i class={selected}></i></div></p>)
                              }

                            })}
                            </div>
                          </td> : null
                    }
                  </tr>
                )
              })}
            </tbody>
          </table>
          {!state.items.length && (<div style="text-align:center"> Não foram encontrados registros </div>)}
        </div>
    );
  }
}

export {LesTable, LesTableColumn, LesTableQueryOpt, LesTableButton};
