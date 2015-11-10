(function(){
    var TOP_TALKS_URL = 'https://api-voting.devoxx.com/DV15/top/talks?limit=10';
    var CATEGORIES_URL = 'https://api-voting.devoxx.com/DV15/categories';

    var Countdown = React.createClass({
        getInitialState: function() {
            var seconds = Math.max(0, this.props.seconds),
                interval = Math.max(1, this.props.interval),
                now = Date.now(),
                endTime = now + (seconds * 1000);

            return {
                endTime: endTime,
                interval: interval,
                output: this.genOutput(endTime)
            };
        },
        render: function() {
            return (
                <span>{this.state.output}</span>
            );
        },
        MINUTE: 60,
        HOUR: 60*60,
        DAY: 60*60*24,
        YEAR: 60*60*24*365,
        getUnits: function(int) {
            if (int < this.MINUTE) return int === 1 ? "second" : "seconds";
            if (int < this.HOUR) return int === this.MINUTE ? "minute" : "minutes";
            if (int < this.DAY) return int === this.HOUR ? "hour" : "hours";
            if (int < this.YEAR) return int === this.DAY ? "day" : "days";
            return int === this.YEAR ? "year" : "years";
        },
        getRemaining: function(seconds){
            var unit = this.getUnits(seconds);
            if (seconds < this.MINUTE) return seconds + " " + unit;
            if (seconds < this.HOUR) return Math.round(seconds/this.MINUTE) + " " + unit;
            if (seconds < this.DAY) return Math.round(seconds/this.HOUR) + " " + unit;
            if (seconds < this.YEAR) return Math.round(seconds/this.DAY) + " " + unit;
            return Math.round(seconds/this.YEAR) + " " + unit;
        },
        genOutput: function(endTime){
            var remainingSeconds = Math.round(Math.max(0, endTime - Date.now()) / 1000),
                remaining = this.getRemaining(remainingSeconds);
            return remaining;
        },
        setupRefresh: function(){
            if (Date.now() < this.state.endTime) {
                setTimeout(this.updateOutput, this.state.interval * 1000);
            }
        },
        updateOutput: function(){
            this.setState({
                "output": this.genOutput(this.state.endTime, this.state.timeUnit)
            });
        },
        componentDidMount: function() {
            this.setupRefresh();
        },
        componentDidUpdate: function(){
            this.setupRefresh();
        }
    });

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
                <div className="top-list-container">
                    <div className="page-header">
                        <img src="img/devoxx_logo.gif" alt="Devoxx" />
                        <h1>{this.state.title} Top Talks</h1>
                    </div>
                    <div className="talks-container">
                        <TalksContainer loadingTalks={this.state.loadingTalks} talks={this.state.talks} error={this.state.error} refreshInterval={this.state.refreshInterval} />
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
            console.log(jqXHR, textStatus, errorThrown);
            this.setProps({ error: "Oops... data is out-of-date!", loadingTalks: false });
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
                talks: [],
                refreshInterval: Math.round(this.props.refreshInterval / 1000)
            }
        },
        componentWillReceiveProps: function(nextProps) {
            this.setState(nextProps);
        },
        render: function() {
            var loadingTalks = this.state.loadingTalks ? <div className="alert alert-warning" id="loading-talks-notification">Loading talks...</div> : '';
            var now = Date.now();
            var error = this.state.error === '' ? '' : (
                <div className="alert alert-danger" id="error-notification">{this.state.error} Retrying in <Countdown interval="1" seconds={this.state.refreshInterval} key={now} /></div>
            );
            var loaded = this.state.loadingTalks === false;
            var table = loaded ? <Talks details={this.state.talks} error={this.state.error} key="devoxx-top-talks" /> : '';
            return (
              <div>
                {loadingTalks}
                {error}
                {table}
                <p className='text-center text-muted'><small>This table will frequently reload the results automatically (and recover from network errors).</small></p>
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
          var tbody = _.isEmpty(talks) ? <NoTalks /> : talks;
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
                {tbody}
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

    var NoTalks = React.createClass({
        render: function(){
            return (
                <tr className="warning">
                    <td colSpan="7" className="text-center">Sorry, there aren't any votes yet!</td>
                </tr>
            );
        }
    });

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    function createTopTalksTable(key, title, url) {
        if (document.getElementById(key)) {
            console.error("The key '" + key + "' is already in use");
            return;
        }
        $("#main").append(
            $("<div></div>", {
                id: key
            })
        );
        React.render(<TopTalks key={key} title={title} url={url} />, document.getElementById(key));
    }

    console.log("Here we go")

    createTopTalksTable('devoxx-top-talks', '2015', TOP_TALKS_URL);

    _.forEach(['monday', 'tuesday', 'wednesday', 'thursday', 'friday'], function(dow){
        createTopTalksTable(
            'devoxx-top-talks' + dow,
            '2015 ' + capitalizeFirstLetter(dow) + "'s",
            TOP_TALKS_URL + "&day=" + dow
        );
    });

    $.ajax({
        url: CATEGORIES_URL,
        type: "GET",
        timeout: 10*1000,
        dataType: "json"
    }).done(function(data){
        if (data.tracks) {
            _.forEach(_.sortBy(data.tracks), function(track, idx){
                createTopTalksTable(
                    'devoxx-top-talks-track-' + idx,
                    "2015 '" + track + "'",
                    TOP_TALKS_URL + "&track=" + encodeURIComponent(track)
                );
            });
        }
        if (data.talkTypes) {
            _.forEach(_.sortBy(data.talkTypes), function(type, idx){
                createTopTalksTable(
                    'devoxx-top-talks-type-' + idx,
                    "2015 '" + type + "'",
                    TOP_TALKS_URL + "&talkType=" + encodeURIComponent(type)
                );
            });
        }
    }).fail(function(){
        console.error("Retrieving categories failed!");
    });

})();
