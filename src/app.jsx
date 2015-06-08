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
        var table = loaded ? <Talks details={this.state.talks} /> : '';
        return (
          <div key="devoxx-top-talks-container">
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
        return (
          <tr key={'devoxx-talk-' + talk.name}>
            <td>{parseInt(idx) + 1}</td>
            <td>{talk.title}</td>
            <td>{talk.speakers.join(', ')}</td>
            <td>{talk.type}</td>
            <td>{talk.track}</td>
            <td>{Math.round(talk.avg * 10)/10}</td>
            <td>{talk.count}</td>
          </tr>
        );
      });
      return (
        <table className="table table-striped" key="devoxx-top-talks">
          <thead>
            <tr>
              <th>#</th>
              <th>Title</th>
              <th>Speakers</th>
              <th>Talk Type</th>
              <th>Track</th>
              <th>Avg Vote</th>
              <th># Votes</th>
            </tr>
          </thead>
          <tbody>
            {talks}
          </tbody>
        </table>
      );
    }
});


var app = React.render(<TalksContainer loadingTalks="true" />, document.getElementById('main'));

(function(){
    var TOP_TALKS_URL = 'http://api.vote.devoxx.co.uk/duk15/top/talks?limit=10';

    function render(data) {
        app.setProps({ loadingTalks: false, talks: data.talks});
    }

    function error(jqXHR, textStatus, errorThrown) {
        console.log(jqXHR);
        app.setProps({ error: "Oops... (" + jqXHR.status + ") " + textStatus + ": " + errorThrown, loadingTalks: false })
    }

    function refresh(){
        setTimeout(getTalks, 5000);
    }

    function getTalks(){
        $.get(TOP_TALKS_URL).done(function(data){
          render(data);
          refresh();
        }).fail(error);
    };

    getTalks();

})();
