import React, { Component } from 'react'
import PropTypes from 'prop-types';
import UserRepository from '@service/user/UserRepository';
import moment from 'moment';
import { Link } from "react-router-dom";
import AbstractSeries from '@component/abstract/AbstractSeries';

import './Series.css';

export default class Series extends AbstractSeries {
	constructor(props) {
		super();
		this.ur = UserRepository;

		this.state = {
			activeSeason: 0,
			series: props.series
		}

		this.getActiveSeason = this.getActiveSeason.bind(this);
		this.incrementActiveSeason = this.incrementActiveSeason.bind(this);
		this.decrementActiveSeason = this.decrementActiveSeason.bind(this);
		this.seasonScroll = this.seasonScroll.bind(this);
	}

	componentDidMount() {
		this.setState({
			activeSeason: this.getActiveSeason(),
			series: this.props.series
		});
	}

	getActiveSeason() {
		let activeSeason = 1;

		if (this.state.series) {
			this.state.series.seasons.some(season => {
				if (season.episodes != undefined)
					return season.episodes.some(episode => {
						activeSeason = season.seasonNumber;
						return !episode.watched;
					});
			});
		}

		return activeSeason;
	}

	decrementActiveSeason() {
		if (this.state.activeSeason > 1) {
			this.setState({
				activeSeason: this.state.activeSeason - 1
			});
		}
	}
	
	incrementActiveSeason() {
		if (this.state.activeSeason < (this.state.series.seasons.length)) {
			this.setState({
				activeSeason: this.state.activeSeason + 1
			});
		}
	}

	getSeasonClass(num) {
		if (num === this.state.activeSeason) {
			return 'active';
		} else if (num - 1 === this.state.activeSeason) {
			return 'preactive';
		} else if (num + 1 === this.state.activeSeason) {
			return 'preactive';
		} else {
			return '';
		}
	}

	isAirDateAfterToday(episode) {
		return moment(episode.airDate).isAfter();
	}

	createEpisodeTooltip(episode) {
		if(this.isAirDateAfterToday(episode)) {
			return `S${episode.season}E${episode.episode} kommt am ` + moment(episode.airDate).format('DD.MM.YYYY');
		} else {
			return `S${episode.season}E${episode.episode} - ${episode.name} vom ${moment(episode.airDate).format('DD.MM.YYYY')}`;
		}
	}

	seasonScroll(event) {
		event.preventDefault();
		if (event.deltaY > 0) {
			this.incrementActiveSeason();
		} else {
			this.decrementActiveSeason();
		}
	}
	
	render() {
		let self = this;

		const createEpisodes = (episode, index) => {
			return(
				<div key={ index } className="episode-container">
					<button 
						className={ this.isAirDateAfterToday(episode) ? ('fa fa-clock-o') : (episode.watched ? 'fa fa-check-square-o' : 'fa fa-square-o') } 
						title={this.createEpisodeTooltip(episode) }
						onClick={ this.toggleEpisode.bind(this, episode) }>
					</button>
				</div>
			);
		}

		const createSeasonToggle = (season) => {
			let render = true;

			if(season.episodes == undefined)
				return '';

			season.episodes.forEach(episode => {
				render &= moment(episode.airDate).isBefore();
			})
			
			if (render)
				return (
					<button 
						className="fa fa-eye"
						title="Alle Folgen dieser Staffel als gesehen markieren."
						onClick={ self.toggleSeason.bind(self, season) }>
					</button>
				);
		}

		const createSeasons = (season, index) => {
			return(
				<div key={ index } className={ 'season ' + this.getSeasonClass(season.seasonNumber) }>
					<div className="season-title">{ 'Staffel ' + season.seasonNumber }</div>
					<div className="episodes-wrapper" season={ season.seasonNumber }>
						{ (season.episodes != undefined ? season.episodes.map(createEpisodes) : '')}
						{ createSeasonToggle(season) }
					</div>
				</div>
			);
		};

		const seasonMap = () => {
			return (
				<div className="seasons-wrapper">
					<div className="season-container" onWheel={ this.seasonScroll }>
						{ this.state.series.seasons.map(createSeasons) }
					</div>
					<div className="season-navigation">
						<button onClick={ this.decrementActiveSeason }>
							<span className="fa fa-arrow-up"></span>
						</button>
						<button onClick={ this.incrementActiveSeason }>
							<span className="fa fa-arrow-down"></span>
						</button>
					</div>
				</div>
			)
		};

		return (
			<div className="series-card-wrapper">
				<div className="series-card-container">
					<Link className="view-link" to={ `/view/${this.state.series.id}` }><span className="fa fa-tv"></span></Link>
					<div className="banner-wrapper">
						<img src={ this.getImageSrc() } alt="" />
						<div className="image-overlay"/>
					</div>
					<div className="title-wrapper">
						<p className="title-wrapper__text">{this.state.series.name}</p>
					</div>
					{ seasonMap() }
				</div>
			</div>
		)
	}
}

Series.propTypes = {
	series: PropTypes.object.isRequired
}