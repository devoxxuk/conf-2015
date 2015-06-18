(function(){
    var TalksContainer = React.createClass({
        getInitialState: function() {
            return {
                loadingTalks: this.props.loadingTalks === "true" || false,
                error: this.props.error || "",
                talks: []
            }
        },
        componentWillReceiveProps: function(nextProps) {
            this.setState(nextProps);
        },
        render: function() {
            var loadingTalks = this.state.loadingTalks ? <div className="alert alert-warning" id="loading-talks-notification">Loading talks...</div> : '';
            var error = this.state.error === '' ? '' : <div className="alert alert-danger" id="error-notification">{this.state.error}</div>;
            var loaded = this.state.loadingTalks === false && this.state.error === '';
            var table = loaded ? <Talks details={this.state.talks} key="devoxx-top-talks" /> : '';
            return (
              <div>
                {loadingTalks}
                {error}
                {table}
              </div>
            );
        }
    });

    var Talks = React.createClass({
        render: function(){
          var talks = _.map(this.props.details, function(talk, idx){
            return <Talk rowNum={idx} details={talk} key={'devoxx-talk-' + talk.name} />;
          });
          return (
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Title</th>
                  <th>Speakers</th>
                  <th className="devoxx-talk-type">Talk Type</th>
                  <th className="devoxx-track">Track</th>
                  <th>Avg Vote</th>
                  <th className="devoxx-num-votes"># Votes</th>
                </tr>
              </thead>
              <tbody>
                {talks}
              </tbody>
            </table>
          );
        }
    });

    var Talk = React.createClass({
        getInitialState: function(){
            return {
                rowNum: this.props.rowNum,
                details: this.props.details,
                className: ''
            };
        },
        componentWillReceiveProps: function(nextProps) {
            this.setState(nextProps);
        },
        render: function(){
            var talk = this.state.details,
                idx = this.state.rowNum;
            return (
              <tr className={this.state.className}>
                <td>{parseInt(idx) + 1}</td>
                <td>{talk.title}</td>
                <td>{talk.speakers.join(', ')}</td>
                <td className="devoxx-talk-type">{talk.type}</td>
                <td className="devoxx-track">{talk.track}</td>
                <td>{Math.round(talk.avg * 10)/10}</td>
                <td className="devoxx-num-votes">{talk.count}</td>
              </tr>
            );
        }
    });


    var app = React.render(<TalksContainer loadingTalks="true" key="devoxx-top-talks-container" />, document.getElementById('main'));

    var TOP_TALKS_URL = 'http://api.vote.devoxx.co.uk/duk15/top/talks?limit=10';

    function render(data) {
        app.setProps({ loadingTalks: false, talks: data.talks});
    }

    function error(jqXHR, textStatus, errorThrown) {
        console.log(jqXHR);
        app.setProps({ error: "Oops... (" + jqXHR.status + ") " + textStatus + ": " + errorThrown, loadingTalks: false })
    }

    function refresh(){
        setTimeout(getTalks, 60*1000);
    }

    function getTalks(){
        $.get(TOP_TALKS_URL).done(function(data){
          render(data);
          refresh();
        }).fail(error);
    };

    getTalks();

})();
