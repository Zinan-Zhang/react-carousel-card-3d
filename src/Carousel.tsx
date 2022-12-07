import React, { Component } from 'react';

import CarouselSlide from './CarouselSlide';

export type CarouselSlideType = {
  key: string | number;
  content: JSX.Element;
  index?: number | null;
  onClick?: () => void;
};

interface CarouselState {
  index: number;
  goToSlide: number | null;
  prevPropsGoToSlide: number;
  newSlide: boolean;
}

interface CarouselProps {
  slides: CarouselSlideType[];
  goToSlide?: number;
  offsetRadius: number;
  animationConfig: object;
  goToSlideDelay: number;
}

function mod(a: number, b: number): number {
  return ((a % b) + b) % b;
}

class Carousel extends Component<CarouselProps, CarouselState> {
  state: CarouselState = {
    index: 0,
    goToSlide: null,
    prevPropsGoToSlide: 0,
    newSlide: false,
  };

  goToIn?: number;

  static defaultProps = {
    offsetRadius: 2,
    animationConfig: { tension: 120, friction: 14 },
    goToSlideDelay: 200,
  };

  static getDerivedStateFromProps(props: CarouselProps, state: CarouselState) {
    const { goToSlide } = props;

    if (goToSlide !== state.prevPropsGoToSlide) {
      return { prevPropsGoToSlide: goToSlide, goToSlide, newSlide: true };
    }

    return null;
  }

  componentDidUpdate() {
    const { goToSlideDelay } = this.props;
    const { index, goToSlide, newSlide } = this.state;
    if (typeof goToSlide === 'number') {
      if (newSlide) {
        this.handleGoToSlide();
      } else if (index !== goToSlide && typeof window !== 'undefined') {
        window.clearTimeout(this.goToIn);
        this.goToIn = window.setTimeout(this.handleGoToSlide, goToSlideDelay);
      } else if (typeof window !== 'undefined') {
        window.clearTimeout(this.goToIn);
      }
    }
  }

  componentWillUnmount() {
    if (typeof window !== 'undefined') {
      window.clearTimeout(this.goToIn);
    }
  }

  modBySlidesLength = (index: number): number => {
    return mod(index, this.props.slides.length);
  };

  moveSlide = (direction: -1 | 1) => {
    this.setState({
      index: this.modBySlidesLength(this.state.index + direction),
      goToSlide: null,
    });
  };

  getShortestDirection(from: number, to: number): -1 | 0 | 1 {
    if (from > to) {
      if (from - to > this.props.slides.length - 1 - from + to) {
        return 1;
      } else return -1;
    } else if (to > from) {
      if (to - from > from + this.props.slides.length - 1 - to) {
        return -1;
      } else return 1;
    }
    return 0;
  }

  handleGoToSlide = () => {
    if (typeof this.state.goToSlide !== 'number') {
      return;
    }

    const { index } = this.state;

    const goToSlide = mod(this.state.goToSlide, this.props.slides.length);

    if (goToSlide !== index) {
      let direction = this.getShortestDirection(index, goToSlide);
      const isFinished = this.modBySlidesLength(index + direction) === goToSlide;

      this.setState({
        index: this.modBySlidesLength(index + direction),
        newSlide: isFinished,
        goToSlide: isFinished ? null : goToSlide,
      });
    }
  };

  clampOffsetRadius(offsetRadius: number): number {
    const { slides } = this.props;
    const upperBound = Math.floor((slides.length - 1) / 2);

    if (offsetRadius < 0) {
      return 0;
    }
    if (offsetRadius > upperBound) {
      return upperBound;
    }

    return offsetRadius;
  }

  getPresentableSlides(): CarouselSlideType[] {
    const { slides } = this.props;
    const { index } = this.state;
    let { offsetRadius } = this.props;
    offsetRadius = this.clampOffsetRadius(offsetRadius);
    const presentableSlides: CarouselSlideType[] = new Array();

    for (let i = -offsetRadius; i < 1 + offsetRadius; i++) {
      const slide = slides[this.modBySlidesLength(index + i)];
      if (slide) presentableSlides.push(slide);
    }

    return presentableSlides;
  }

  render() {
    const { goToSlide, offsetRadius, animationConfig } = this.props;

    return (
      <React.Fragment>
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          {this.getPresentableSlides().map((slide: CarouselSlideType, presentableIndex: number) => (
            <CarouselSlide
              key={slide.key}
              content={slide.content}
              currentIndex={slide.index}
              onClick={slide.onClick}
              currentSlide={goToSlide}
              offsetRadius={this.clampOffsetRadius(offsetRadius)}
              index={presentableIndex}
              animationConfig={animationConfig}
            />
          ))}
        </div>
      </React.Fragment>
    );
  }
}

export { Carousel };
