var TalksContainer = React.createClass({displayName: "TalksContainer",
    getInitialState: function() {
        return {
            loadingTalks: this.props.loadingTalks === "true" || false,
            talks: []
        }
    },
    componentWillReceiveProps: function(nextProps) {
        this.setState(nextProps);
    },
    render: function() {
        var loadingTalks = this.state.loadingTalks ? React.createElement("div", {className: "alert alert-warning", id: "loading-talks-notification"}, "Loading talks...") : '';
        var table = this.state.loadingTalks ? '' : React.createElement(Talks, {details: this.state.talks}) ;
        return (
          React.createElement("div", {key: "devoxx-top-talks-container"}, 
            loadingTalks, 
            table
          )
        );
    }
});

var Talks = React.createClass({displayName: "Talks",
    render: function(){
      var talks = _.map(this.props.details, function(talk, idx){
        return (
          React.createElement("tr", {key: 'devoxx-talk-' + talk.name}, 
            React.createElement("td", null, idx + 1), 
            React.createElement("td", null, talk.title), 
            React.createElement("td", null, talk.speakers.join(', ')), 
            React.createElement("td", null, talk.type), 
            React.createElement("td", null, talk.track), 
            React.createElement("td", null, Math.round(talk.avg * 10)/10), 
            React.createElement("td", null, talk.count)
          )
        );
      });
      return (
        React.createElement("table", {className: "table table-striped", key: "devoxx-top-talks"}, 
          React.createElement("thead", null, 
            React.createElement("tr", null, 
              React.createElement("th", null, "#"), 
              React.createElement("th", null, "Title"), 
              React.createElement("th", null, "Speakers"), 
              React.createElement("th", null, "Talk Type"), 
              React.createElement("th", null, "Track"), 
              React.createElement("th", null, "Avg Vote"), 
              React.createElement("th", null, "# Votes")
            )
          ), 
          React.createElement("tbody", null, 
            talks
          )
        )
      );
    }
});


var app = React.render(React.createElement(TalksContainer, {loadingTalks: "true"}), document.getElementById('main'));

(function(){
    var TOP_TALKS_URL = 'http://api.vote.devoxx.co.uk/duk15/top/talks?limit=10';

    function render(data) {
        app.setProps({ loadingTalks: false, talks: data.talks});
    }

    $.get(TOP_TALKS_URL).done(render);
})();
