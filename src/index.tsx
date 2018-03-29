import * as React from 'react';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import ResizeObserver from 'resize-observer-polyfill';

import ToggleButton from './ToggleButton';
import DropdownList from './DropdownList';

const Root = styled.div`
  min-width: ${(props: { minWidth: string }) =>
    props.minWidth ? props.minWidth : '250px'};
  position: relative;
  white-space: nowrap;
`;

const Wrapper = styled.div`
  display: inline-block;
  background: ${(props: { background: string }) =>
    props.background ? props.background : 'unset'};
`;

const Item = styled.div`
  display: inline-block;
  padding: ${(props: { itemPadding: string }) =>
    props.itemPadding ? props.itemPadding : '20px'};

  &:first-child {
    padding-left: 0;
  }
`;

interface Props {
  children: Array<React.ReactNode>;
  itemPadding: string;
  minWidth: string;
  offset: number;
  delay: number;
  navSetting: {
    background: string;
  };
  iconSetting: {
    color: string;
    size: number;
    hoverColor: string;
  };
}

interface State {
  resizeId: any;
  children: Array<React.ReactNode>;
  dropdownItems: Array<React.ReactNode>;
  lastItemWidth: Array<number>;
  show: boolean;
}

export default class PriorityNav extends React.Component<Props, State> {
  static defaultProps = {
    offset: 0,
    delay: 50,
  };
  state = {
    resizeId: null,
    children: this.props.children,
    dropdownItems: [],
    lastItemWidth: [],
    show: false,
  };
  outerNav: HTMLDivElement;
  nav: HTMLDivElement;
  items: Map<number, HTMLElement> = new Map();

  componentDidMount() {
    this.doesItFit();
    const resizeObserver = new ResizeObserver(this.onResize);
    resizeObserver.observe(this.outerNav);
  }

  componentWillUnmount() {
    clearInterval(this.state.resizeId!);
  }

  onResize = () => {
    clearTimeout(this.state.resizeId!);
    this.setState({
      resizeId: setTimeout(this.doesItFit, this.props.delay),
    });
  };

  doesItFit = () => {
    if (this.nav) {
      const outerWidth = this.outerNav.offsetWidth;
      const totalWidth = this.nav.offsetWidth;
      if (this.items.size > 0 && totalWidth > outerWidth) {
        this.moveItemToList();
      } else if (
        this.state.dropdownItems.length > 0 &&
        outerWidth >
          totalWidth +
            this.state.lastItemWidth[this.state.lastItemWidth.length - 1] +
            this.props.offset
      ) {
        this.moveItemToNav();
      }
    }
  };

  moveItemToList = () => {
    this.setState((prevState, props) => {
      const children = [...prevState.children];
      const lastItem = children.splice(-1, 1);
      return {
        children,
        dropdownItems: lastItem.concat(prevState.dropdownItems),
        lastItemWidth: [
          ...prevState.lastItemWidth,
          this.items.get(prevState.children.length - 1)!.clientWidth,
        ],
      };
    });
  };

  moveItemToNav = () => {
    this.setState((prevState, props) => {
      const dropdownItems = [...prevState.dropdownItems];
      const firstItemFromList = dropdownItems.splice(0, 1);
      return {
        children: [...prevState.children].concat(firstItemFromList),
        dropdownItems,
        lastItemWidth: prevState.lastItemWidth.splice(0, 1),
      };
    });
  };

  toggleShow = () => {
    this.setState((prevState, props) => ({
      show: !prevState.show,
    }));
  };

  renderChildren = (props: Props) => {
    return React.Children.map(
      this.state.children,
      (child: React.ReactNode, i: number) => {
        return (
          <Item
            innerRef={s => {
              this.items.set(i, s);
            }}
            key={i}
            itemPadding={props.itemPadding}
          >
            {child}
          </Item>
        );
      },
    );
  };

  public render() {
    return (
      <Root
        minWidth={this.props.minWidth}
        innerRef={s => {
          this.outerNav = s;
        }}
      >
        <Wrapper
          {...this.props.navSetting}
          innerRef={s => {
            this.nav = s;
          }}
        >
          {this.renderChildren(this.props)}
          {this.state.dropdownItems.length > 0 && (
            <Trigger
              action={['click']}
              popupAlign={{
                points: ['tl', 'bl'],
                offset: [0, 3]
              }}
              popup={
                <DropdownList>
                  {this.state.dropdownItems.map((item, i) => (
                    <div key={i}>{item}</div>
                  ))}
                </DropdownList>
              }
            >
              <ToggleButton {...this.props.iconSetting} />
            </Trigger>
          )}
        </Wrapper>
      </Root>
    );
  }
}