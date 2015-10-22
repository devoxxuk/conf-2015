(function(){
    var TOP_TALKS_URL = 'https://evening-mesa-4747.herokuapp.com/dbe15/top/talks?limit=10';

    var TopTalks = React.createClass({
        getInitialState: function(){
            return {
                title: this.props.title,
                loadingTalks: true,
                error: this.props.error || "",
                talks: [],
                url: this.props.url || TOP_TALKS_URL,
                refreshInterval: parseInt(this.props.refreshInterval) || 60*1000
            };
        },
        componentWillReceiveProps: function(nextProps) {
            this.setState(nextProps);
        },
        render: function(){
            return (
                <div>
                    <div className="page-header">
                        <img src="img/devoxx_logo.gif" alt="Devoxx" />
                        <h1>{this.state.title} Top Talks</h1>
                    </div>
                    <div className="talk-container">
                        <TalksContainer loadingTalks={this.state.loadingTalks} talks={this.state.talks} error={this.state.error} />
                    </div>
                </div>
            );
        },
        getTalks: function(){
            var url = this.state.url,
                refresh = this.refresh,
                error = this.handleError,
                render = this.handleSuccess;
            $.ajax({
                url: url,
                type: "GET",
                timeout: 10*1000,
                dataType: "json"
            }).done(function(data){
                render(data);
                refresh();
            }).fail(function(jqXHR, textStatus, errorThrown) {
                error(jqXHR, textStatus, errorThrown);
                refresh();
            });
        },
        refresh: function(){
            setTimeout(this.getTalks, this.state.refreshInterval);
        },
        handleSuccess: function(data){
            this.setProps({ loadingTalks: false, talks: data.talks, error: ''});
        },
        handleError: function(jqXHR, textStatus, errorThrown) {
            console.log(jqXHR);
            this.setProps({ error: "Oops... (" + jqXHR.status + ") " + textStatus + ": " + errorThrown, loadingTalks: false });
        },
        componentDidMount: function(){
            this.getTalks();
        }
    });

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
            var loaded = this.state.loadingTalks === false;
            var table = loaded ? <Talks details={this.state.talks} error={this.state.error} key="devoxx-top-talks" /> : '';
            return (
              <div>
                {loadingTalks}
                {error}
                {table}
                <p className='text-center text-muted'><small>This page will reload the results automatically (and recover from network errors).</small></p>
              </div>
            );
        }
    });

    var Talks = React.createClass({
        shouldComponentUpdate: function(nextProps){
            return nextProps.error === '';
        },
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

    var app = React.render(<TopTalks key="devoxx-top-talks" title="BE 2015" url={TOP_TALKS_URL} />, document.getElementById('main'));

})();
