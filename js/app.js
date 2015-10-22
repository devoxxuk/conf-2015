(function(){
    var TOP_TALKS_URL = 'https://evening-mesa-4747.herokuapp.com/dbe15/top/talks?limit=10';

    var TopTalks = React.createClass({displayName: "TopTalks",
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
                React.createElement("div", null, 
                    React.createElement("div", {className: "page-header"}, 
                        React.createElement("img", {src: "img/devoxx_logo.gif", alt: "Devoxx"}), 
                        React.createElement("h1", null, this.state.title, " Top Talks")
                    ), 
                    React.createElement("div", {className: "talk-container"}, 
                        React.createElement(TalksContainer, {loadingTalks: this.state.loadingTalks, talks: this.state.talks, error: this.state.error})
                    )
                )
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

    var TalksContainer = React.createClass({displayName: "TalksContainer",
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
            var loadingTalks = this.state.loadingTalks ? React.createElement("div", {className: "alert alert-warning", id: "loading-talks-notification"}, "Loading talks...") : '';
            var error = this.state.error === '' ? '' : React.createElement("div", {className: "alert alert-danger", id: "error-notification"}, this.state.error);
            var loaded = this.state.loadingTalks === false;
            var table = loaded ? React.createElement(Talks, {details: this.state.talks, error: this.state.error, key: "devoxx-top-talks"}) : '';
            return (
              React.createElement("div", null, 
                loadingTalks, 
                error, 
                table, 
                React.createElement("p", {className: "text-center text-muted"}, React.createElement("small", null, "This page will reload the results automatically (and recover from network errors)."))
              )
            );
        }
    });

    var Talks = React.createClass({displayName: "Talks",
        shouldComponentUpdate: function(nextProps){
            return nextProps.error === '';
        },
        render: function(){
          var talks = _.map(this.props.details, function(talk, idx){
            return React.createElement(Talk, {rowNum: idx, details: talk, key: 'devoxx-talk-' + talk.name});
          });
          return (
            React.createElement("table", {className: "table table-striped"}, 
              React.createElement("thead", null, 
                React.createElement("tr", null, 
                  React.createElement("th", null, "#"), 
                  React.createElement("th", null, "Title"), 
                  React.createElement("th", null, "Speakers"), 
                  React.createElement("th", {className: "devoxx-talk-type"}, "Talk Type"), 
                  React.createElement("th", {className: "devoxx-track"}, "Track"), 
                  React.createElement("th", null, "Avg Vote"), 
                  React.createElement("th", {className: "devoxx-num-votes"}, "# Votes")
                )
              ), 
              React.createElement("tbody", null, 
                talks
              )
            )
          );
        }
    });

    var Talk = React.createClass({displayName: "Talk",
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
              React.createElement("tr", {className: this.state.className}, 
                React.createElement("td", null, parseInt(idx) + 1), 
                React.createElement("td", null, talk.title), 
                React.createElement("td", null, talk.speakers.join(', ')), 
                React.createElement("td", {className: "devoxx-talk-type"}, talk.type), 
                React.createElement("td", {className: "devoxx-track"}, talk.track), 
                React.createElement("td", null, Math.round(talk.avg * 10)/10), 
                React.createElement("td", {className: "devoxx-num-votes"}, talk.count)
              )
            );
        }
    });

    var app = React.render(React.createElement(TopTalks, {key: "devoxx-top-talks", title: "BE 2015", url: TOP_TALKS_URL}), document.getElementById('main'));

})();
