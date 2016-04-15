(function () {
    var conference = (window.location.hash || 'DV15').replace(/#/, '');
    var baseUrl = 'https://api-voting.devoxx.com/';
    var TOP_TALKS_URL = baseUrl + conference + '/top/talks?limit=10';
    var CATEGORIES_URL = baseUrl + conference + '/categories';

    var Countdown = React.createClass({
        getInitialState: function () {
            var seconds = Math.max(0, this.props.seconds),
                interval = Math.max(1, this.props.interval),
                now = Date.now(),
                endTime = now + seconds * 1000;

            return {
                endTime: endTime,
                interval: interval,
                output: this.genOutput(endTime)
            };
        },
        render: function () {
            return React.createElement(
                'span',
                null,
                this.state.output
            );
        },
        MINUTE: 60,
        HOUR: 60 * 60,
        DAY: 60 * 60 * 24,
        YEAR: 60 * 60 * 24 * 365,
        getUnits: function (int) {
            if (int < this.MINUTE) return int === 1 ? "second" : "seconds";
            if (int < this.HOUR) return int === this.MINUTE ? "minute" : "minutes";
            if (int < this.DAY) return int === this.HOUR ? "hour" : "hours";
            if (int < this.YEAR) return int === this.DAY ? "day" : "days";
            return int === this.YEAR ? "year" : "years";
        },
        getRemaining: function (seconds) {
            var unit = this.getUnits(seconds);
            if (seconds < this.MINUTE) return seconds + " " + unit;
            if (seconds < this.HOUR) return Math.round(seconds / this.MINUTE) + " " + unit;
            if (seconds < this.DAY) return Math.round(seconds / this.HOUR) + " " + unit;
            if (seconds < this.YEAR) return Math.round(seconds / this.DAY) + " " + unit;
            return Math.round(seconds / this.YEAR) + " " + unit;
        },
        genOutput: function (endTime) {
            var remainingSeconds = Math.round(Math.max(0, endTime - Date.now()) / 1000),
                remaining = this.getRemaining(remainingSeconds);
            return remaining;
        },
        setupRefresh: function () {
            if (Date.now() < this.state.endTime) {
                setTimeout(this.updateOutput, this.state.interval * 1000);
            }
        },
        updateOutput: function () {
            this.setState({
                "output": this.genOutput(this.state.endTime, this.state.timeUnit)
            });
        },
        componentDidMount: function () {
            this.setupRefresh();
        },
        componentDidUpdate: function () {
            this.setupRefresh();
        }
    });

    var TopTalks = React.createClass({
        getInitialState: function () {
            return {
                title: this.props.title,
                loadingTalks: true,
                error: this.props.error || "",
                talks: [],
                url: this.props.url || TOP_TALKS_URL,
                refreshInterval: parseInt(this.props.refreshInterval) || 60 * 1000
            };
        },
        componentWillReceiveProps: function (nextProps) {
            this.setState(nextProps);
        },
        render: function () {
            return React.createElement(
                'div',
                { className: 'top-list-container' },
                React.createElement(
                    'div',
                    { className: 'page-header' },
                    React.createElement('img', { src: 'img/devoxx_logo.gif', alt: 'Devoxx' }),
                    React.createElement(
                        'h1',
                        null,
                        this.state.title,
                        ' Top Talks'
                    )
                ),
                React.createElement(
                    'div',
                    { className: 'talks-container' },
                    React.createElement(TalksContainer, { loadingTalks: this.state.loadingTalks, talks: this.state.talks, error: this.state.error, refreshInterval: this.state.refreshInterval })
                )
            );
        },
        getTalks: function () {
            var url = this.state.url,
                refresh = this.refresh,
                error = this.handleError,
                render = this.handleSuccess;
            $.ajax({
                url: url,
                type: "GET",
                timeout: 10 * 1000,
                dataType: "json"
            }).done(function (data) {
                render(data);
                refresh();
            }).fail(function (jqXHR, textStatus, errorThrown) {
                error(jqXHR, textStatus, errorThrown);
                refresh();
            });
        },
        refresh: function () {
            setTimeout(this.getTalks, this.state.refreshInterval);
        },
        handleSuccess: function (data) {
            this.setProps({ loadingTalks: false, talks: data.talks, error: '' });
        },
        handleError: function (jqXHR, textStatus, errorThrown) {
            console.log(jqXHR, textStatus, errorThrown);
            this.setProps({ error: "Oops... data is out-of-date!", loadingTalks: false });
        },
        componentDidMount: function () {
            this.getTalks();
        }
    });

    var TalksContainer = React.createClass({
        getInitialState: function () {
            return {
                loadingTalks: this.props.loadingTalks === "true" || false,
                error: this.props.error || "",
                talks: [],
                refreshInterval: this.props.refreshInterval
            };
        },
        componentWillReceiveProps: function (nextProps) {
            this.setState(nextProps);
        },
        render: function () {
            var loadingTalks = this.state.loadingTalks ? React.createElement(
                'div',
                { className: 'alert alert-warning', id: 'loading-talks-notification' },
                'Loading talks...'
            ) : '';
            var now = Date.now();
            var error = this.state.error === '' ? '' : React.createElement(
                'div',
                { className: 'alert alert-danger', id: 'error-notification' },
                this.state.error,
                ' Retrying in ',
                React.createElement(Countdown, { interval: '1', seconds: this.state.refreshInterval / 1000, key: now })
            );
            var loaded = this.state.loadingTalks === false;
            var table = loaded ? React.createElement(Talks, { details: this.state.talks, error: this.state.error, key: 'devoxx-top-talks' }) : '';
            return React.createElement(
                'div',
                null,
                loadingTalks,
                error,
                table,
                React.createElement(
                    'p',
                    { className: 'text-center text-muted' },
                    React.createElement(
                        'small',
                        null,
                        'This table will frequently reload the results automatically (and recover from network errors).'
                    )
                )
            );
        }
    });

    var Talks = React.createClass({
        shouldComponentUpdate: function (nextProps) {
            return nextProps.error === '';
        },
        render: function () {
            var talks = _.map(this.props.details, function (talk, idx) {
                return React.createElement(Talk, { rowNum: idx, details: talk, key: 'devoxx-talk-' + talk.id });
            });
            var tbody = _.isEmpty(talks) ? React.createElement(NoTalks, null) : talks;
            return React.createElement(
                'table',
                { className: 'table table-striped' },
                React.createElement(
                    'thead',
                    null,
                    React.createElement(
                        'tr',
                        null,
                        React.createElement(
                            'th',
                            null,
                            '#'
                        ),
                        React.createElement(
                            'th',
                            null,
                            'Title'
                        ),
                        React.createElement(
                            'th',
                            null,
                            'Speakers'
                        ),
                        React.createElement(
                            'th',
                            { className: 'devoxx-talk-type' },
                            'Talk Type'
                        ),
                        React.createElement(
                            'th',
                            { className: 'devoxx-track' },
                            'Track'
                        ),
                        React.createElement(
                            'th',
                            null,
                            'Avg Vote'
                        ),
                        React.createElement(
                            'th',
                            { className: 'devoxx-num-votes' },
                            '# Votes'
                        )
                    )
                ),
                React.createElement(
                    'tbody',
                    null,
                    tbody
                )
            );
        }
    });

    var Talk = React.createClass({
        getInitialState: function () {
            return {
                rowNum: this.props.rowNum,
                details: this.props.details,
                className: ''
            };
        },
        componentWillReceiveProps: function (nextProps) {
            this.setState(nextProps);
        },
        render: function () {
            var talk = this.state.details,
                idx = this.state.rowNum,
                titleHtml = talk.youtubeURL !== null && talk.youtubeURL !== "" ? React.createElement(
                'a',
                { href: talk.youtubeURL },
                talk.title
            ) : talk.title;
            return React.createElement(
                'tr',
                { className: this.state.className },
                React.createElement(
                    'td',
                    null,
                    parseInt(idx) + 1
                ),
                React.createElement(
                    'td',
                    null,
                    titleHtml
                ),
                React.createElement(
                    'td',
                    null,
                    talk.speakers.map(function (s) {
                        return s.name;
                    }).join(', ')
                ),
                React.createElement(
                    'td',
                    { className: 'devoxx-talk-type' },
                    talk.talkType
                ),
                React.createElement(
                    'td',
                    { className: 'devoxx-track' },
                    talk.track
                ),
                React.createElement(
                    'td',
                    null,
                    Math.round(talk.avg * 10) / 10
                ),
                React.createElement(
                    'td',
                    { className: 'devoxx-num-votes' },
                    talk.count
                )
            );
        }
    });

    var NoTalks = React.createClass({
        render: function () {
            return React.createElement(
                'tr',
                { className: 'warning' },
                React.createElement(
                    'td',
                    { colSpan: '7', className: 'text-center' },
                    'Sorry, there aren\'t any votes yet!'
                )
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
        $("#main").append($("<div></div>", {
            id: key
        }));
        React.render(React.createElement(TopTalks, { key: key, title: title, url: url }), document.getElementById(key));
    }

    createTopTalksTable('devoxx-top-talks', '', TOP_TALKS_URL);

    _.forEach(['monday', 'tuesday', 'wednesday', 'thursday', 'friday'], function (dow) {
        createTopTalksTable('devoxx-top-talks' + dow, ' ' + capitalizeFirstLetter(dow) + "'s", TOP_TALKS_URL + "&day=" + dow);
    });

    $.ajax({
        url: CATEGORIES_URL,
        type: "GET",
        timeout: 10 * 1000,
        dataType: "json"
    }).done(function (data) {
        if (data.tracks) {
            _.forEach(_.sortBy(data.tracks), function (track, idx) {
                createTopTalksTable('devoxx-top-talks-track-' + idx, "2015 '" + track + "'", TOP_TALKS_URL + "&track=" + encodeURIComponent(track));
            });
        }
        if (data.talkTypes) {
            _.forEach(_.sortBy(data.talkTypes), function (type, idx) {
                createTopTalksTable('devoxx-top-talks-type-' + idx, "2015 '" + type + "'", TOP_TALKS_URL + "&talkType=" + encodeURIComponent(type));
            });
        }
    }).fail(function () {
        console.error("Retrieving categories failed!");
    });
})();
