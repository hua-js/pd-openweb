﻿/* eslint-disable */
import PropTypes from 'prop-types';

import React, { Component, Fragment } from 'react';
import cx from 'classnames'; // eslint-disable-line
import Menu from './Menu';
import MenuItem from './MenuItem';
import Icon from './Icon';
import Trigger from 'rc-trigger';
import formControl from 'ming-ui/decorators/formControl';
import './less/Dropdown.less';

const builtinPlacements = {
  left: {
    points: ['cr', 'cl'],
  },
  right: {
    points: ['cl', 'cr'],
  },
  top: {
    points: ['bc', 'tc'],
  },
  bottom: {
    points: ['tc', 'bc'],
  },
  topLeft: {
    points: ['bl', 'tl'],
  },
  topRight: {
    points: ['br', 'tr'],
  },
  bottomRight: {
    points: ['tr', 'br'],
  },
  bottomLeft: {
    points: ['tl', 'bl'],
  },
};

@formControl
class Dropdown extends Component {
  /* eslint-disable */
  static propTypes = {
    /**
     * 未选择时的默认提示
     */
    placeholder: PropTypes.string,
    /**
     * 回调，参数为选中item的value值
     */
    onChange: PropTypes.func,
    defaultValue: PropTypes.any,
    value: PropTypes.any,
    /**
     * 禁用 Dropdown
     */
    disabled: PropTypes.bool,
    /**
     * Menu的样式
     */
    menuStyle: PropTypes.object,
    /**
     * Menu的样式名
     */
    menuClass: PropTypes.string,
    currentItemClass: PropTypes.object,
    /**
     * 表单item名字
     */
    name: PropTypes.string,
    /**
     * 下拉列表最高高度
     */
    maxHeight: PropTypes.number,
    /**
     * 给withChildren用
     */
    $formDataChange: PropTypes.func,
    className: PropTypes.string,
    hoverTheme: PropTypes.bool, // hover变成主题色
    /**
     * 空状态
     */
    noData: PropTypes.node,
    /**
     * 样式
     */
    style: PropTypes.object,
    /**
     * item是否显示title
     */
    showItemTitle: PropTypes.bool,
    /**
     * 数据
     */
    /** border样式 */
    border: PropTypes.bool,
    // 是否不更新组件value
    noChangeValue: PropTypes.bool,
    data: PropTypes.arrayOf(
      PropTypes.oneOfType([
        PropTypes.shape({
          /**
           *  默认default  hr为分割线
           */
          type: PropTypes.oneOf(['hr', 'default']),
          text: PropTypes.any,
          /**
           * 接收任何类型，并返回原始值
           */
          value: PropTypes.any,
          /**
           * 是否禁用
           */
          disabled: PropTypes.bool,
          /**
           * 说明
           */
          desc: PropTypes.string,
          /**
           * 字体图标的名字
           */
          iconName: PropTypes.string,
          /**
           * 图标后置
           */
          iconAtEnd: PropTypes.bool,
          /**
           * 图标 hint
           */
          iconHint: PropTypes.string,
          Children: PropTypes.array,
          /** 显示结果 */
          renderValue: PropTypes.string,
          searchText: PropTypes.string,
        }),
        PropTypes.arrayOf(
          PropTypes.shape({
            /**
             *  默认default  hr为分割线
             */
            type: PropTypes.oneOf(['hr', 'default']),
            text: PropTypes.any,
            /**
             * 接收任何类型，并返回原始值
             */
            value: PropTypes.any,
            /**
             * 是否禁用
             */
            disabled: PropTypes.bool,
            /**
             * 说明
             */
            desc: PropTypes.string,
            /**
             * 字体图标的名字
             */
            iconName: PropTypes.string,
            /**
             * 图标后置
             */
            iconAtEnd: PropTypes.bool,
            /**
             * 图标 hint
             */
            iconHint: PropTypes.string,
            Children: PropTypes.array,
            /** 显示结果 */
            renderValue: PropTypes.string,
          }),
        ),
      ]),
    ),
    /**
     * 菜单展开状态变更回调
     */
    onVisibleChange: PropTypes.func,
    /**
     * render title
     */
    renderTitle: PropTypes.func,
    AppendToBody: PropTypes.bool,
    selectClose: PropTypes.bool,
    openSearch: PropTypes.bool,
    cancelAble: PropTypes.bool, //可取消的
    renderError: PropTypes.func, // 错误结果显示
    disabledClickElement: PropTypes.string, // 禁止点击的元素（id、class）
  };
  /* eslint-enable */
  static defaultProps = {
    noData: '无数据',
    placeholder: _l('请选择'),
    renderValue: '{{value}}',
    isAppendToBody: false,
    selectClose: true,
    openSearch: false,
    onVisibleChange: () => {},
    disabledClickElement: '',
  };

  constructor(props) {
    super(props);
    let value;
    if (props.defaultValue !== undefined) {
      value = props.defaultValue;
    }
    if (props.value !== undefined) {
      value = props.value;
    }

    this.state = {
      value,
      showMenu: false,
      keywords: '111',
    };
    this.props.$formDataChange(value);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.value !== this.props.value) {
      // eslint-disable-line eqeqeq
      this.setState({
        value: nextProps.value,
      });
      this.props.$formDataChange(nextProps.value);
    }
  }
  /* eslint-disable */
  getTextFromDataById(data, value) {
    let text = this.props.placeholder;
    const getTextFromList = list => {
      list.forEach(item => {
        if (item.value != undefined && item.value === value) {
          // eslint-disable-line eqeqeq
          text = item.text;
          return false;
        } else if (item.children) {
          getTextFromList(item.children);
        } else if (_.isArray(item)) {
          getTextFromList(item);
        }
      });
    };
    getTextFromList(data);
    return text;
  }
  /* eslint-enable */
  handleClick() {
    // Dropdown disabled
    if (this.props.disabled) {
      return;
    } else {
      const visible = !this.state.showMenu;
      this.setState(
        {
          showMenu: visible,
          keywords: '',
        },
        () => {
          this.props.onVisibleChange(visible);
          if (this.state.showMenu && this.search) {
            this.search.focus();
          }
        },
      );
    }
  }

  handleChange(event, item) {
    if (item.disabled) {
      return;
    }
    if (this.props.value == undefined && !this.props.noChangeValue) {
      // eslint-disable-line eqeqeq
      this.setState({
        value: item.value,
      });
      this.props.$formDataChange(item.value);
    }

    if (this.props.selectClose) {
      this.setState({
        showMenu: false,
      });
      this.props.onVisibleChange(false);
    }

    if (this.props.onChange) {
      this.props.onChange(item.value);
    }
  }

  componentDidUpdate() {
    this.trigger && this.trigger.forcePopupAlign();
  }

  filterFun(item) {
    const { keywords } = this.state;
    const text = typeof item.text === 'string' ? item.text : item.searchText || '';

    return (
      String(text)
        .toLowerCase()
        .indexOf(keywords.toLowerCase()) > -1
    );
  }

  checkIsNull(item) {
    if (!item.length) return true;
    if (item.length && _.isArray(item[0]) && !item.filter(o => o.length).length) return true;

    return false;
  }

  renderListItem(data) {
    const { showItemTitle, currentItemClass, value } = this.props;

    return data.map((item, index) => {
      if (_.isArray(item)) {
        return (
          <Fragment key={index}>
            {this.renderListItem(item)}
            {!!item.length && <div className="Dropdown--hr" />}
          </Fragment>
        );
      } else {
        return (
          <Fragment key={index}>
            {item.title ? (
              <li className="ming MenuItem ming Item title">
                <div className="pLeft16 pRight16 Gray_9e ellipsis">{item.title}</div>
              </li>
            ) : null}
            {item.isTip ? (
              <li className="ming MenuItem ming Item title">
                <div className="pLeft16 pRight16">{item.text}</div>
              </li>
            ) : (
              <MenuItem
                {...item}
                className={cx(item.className, value === item.value && currentItemClass ? currentItemClass : '')}
                data-value={item.value}
                icon={
                  item.iconName || item.icon ? <Icon icon={item.iconName || item.icon} hint={item.iconHint} /> : null
                }
                iconAtEnd={item.iconAtEnd}
                iconHint={item.iconHint}
                onClick={event => {
                  event.stopPropagation();
                  this.handleChange(event, item);
                }}
                title={showItemTitle && item.text}
              >
                <div className="itemText">{item.text}</div>
              </MenuItem>
            )}
          </Fragment>
        );
      }
    });
  }

  getInputWidth = () => {
    if (this.props.isAppendToBody && this._input) {
      return { width: this._input.getBoundingClientRect().width };
    }
    return {};
  };

  displayMenu = () => {
    const { showMenu, keywords } = this.state;
    const { data, maxHeight, menuStyle, menuClass, noData, children, isAppendToBody, openSearch } = this.props;

    const searchData = [];

    (data || []).forEach(item => {
      if (_.isArray(item)) {
        searchData.push(item.filter(o => this.filterFun(o)));
      } else if (this.filterFun(item)) {
        searchData.push(item);
      }
    });

    if (!showMenu) return <div />;

    return (
      <Menu
        className={menuClass}
        isAppendToBody={isAppendToBody}
        parentMenuItem={this}
        style={{
          maxHeight: maxHeight || 300,
          overflowY: 'auto',
          overflowX: 'hidden',
          ...this.getInputWidth(),
          ...menuStyle,
        }}
        onClickAway={() => {
          this.setState({
            showMenu: false,
          });
          this.props.onVisibleChange(false);
        }}
        onClickAwayExceptions={[this._input]}
        fixedHeader={
          openSearch &&
          !!data.length && (
            <div
              className="flexRow"
              style={{
                padding: '0 16px 0 14px',
                height: 36,
                alignItems: 'center',
                borderBottom: '1px solid #e0e0e0',
                marginBottom: 5,
              }}
            >
              <i className="icon-search Gray_75 Font14" />
              <input
                type="text"
                ref={search => {
                  this.search = search;
                }}
                autoFocus
                className="mLeft5 flex Border0 placeholderColor w100"
                placeholder={_l('搜索')}
                onChange={evt => this.setState({ keywords: evt.target.value.trim() })}
              />
            </div>
          )
        }
      >
        {searchData && !this.checkIsNull(searchData) ? (
          this.renderListItem(searchData)
        ) : (
          <MenuItem disabled>
            <div>{keywords ? _l('暂无搜索结果') : noData}</div>
          </MenuItem>
        )}
        {children}
      </Menu>
    );
  };

  displayPointer = () => {
    const { value } = this.state;
    const { placeholder, data, cancelAble, disabledClickElement } = this.props;
    const selectedData = _.find(data, item => item.value === value);
    return (
      <div
        className={cx('Dropdown--input', { 'Dropdown--border': !!this.props.border }, { active: this.state.showMenu })}
        ref={input => {
          this._input = input;
        }}
        onClick={event => {
          event.stopPropagation();
          if (disabledClickElement) {
            !$(event.target).closest(disabledClickElement).length && this.handleClick();
          } else {
            this.handleClick();
          }
        }}
      >
        {value != undefined ? ( // eslint-disable-line eqeqeq
          <span
            className={cx('value', {
              ThemeHoverColor3: this.props.hoverTheme,
              ThemeHoverBorderColor3: this.props.hoverTheme,
            })}
          >
            {this.props.renderError && !this.props.data.map(o => o.value).includes(value)
              ? this.props.renderError()
              : this.props.renderTitle
              ? this.props.renderTitle(selectedData)
              : this.props.renderValue.replace(
                  /{{value}}/g,
                  this.getTextFromDataById(this.props.data, this.state.value),
                )}
          </span>
        ) : (
          <span className="Dropdown--placeholder Gray_bd ellipsis InlineBlock">{placeholder}</span>
        )}
        {cancelAble && value != undefined ? (
          <span className="actionIcon Hand mLeft8">
            <Icon
              icon="cancel1"
              className="Gray_9e clearIcon"
              onClick={e => {
                e.stopPropagation();
                if (value != undefined) {
                  this.setState({
                    value: undefined,
                  });
                  this.props.$formDataChange(undefined);
                }
                if (this.props.selectClose) {
                  this.setState({
                    showMenu: false,
                  });
                  this.props.onVisibleChange(false);
                }
                if (this.props.onChange) {
                  this.props.onChange(undefined);
                }
              }}
            />
            <Icon icon="arrow-down-border" className="Gray_9e dropArrow" />
          </span>
        ) : (
          <Icon icon="arrow-down-border" className="mLeft8 Gray_9e" />
        )}
      </div>
    );
  };

  render() {
    const { isAppendToBody, className, menuClass, disabled, style, onVisibleChange } = this.props;
    return (
      <div className={`ming Dropdown pointer ${className || ''} ${disabled ? 'disabled' : ''}`} style={style}>
        {isAppendToBody ? (
          <Trigger
            ref={trigger => (this.trigger = trigger)}
            action={['click']}
            popup={this.displayMenu()}
            popupClassName={cx('dropdownTrigger', menuClass)}
            popupVisible={this.state.showMenu}
            popupAlign={{
              points: ['tl', 'bl'],
              overflow: {
                adjustX: true,
                adjustY: true,
              },
            }}
          >
            {this.displayPointer()}
          </Trigger>
        ) : (
          <div>
            {this.displayPointer()}
            {this.displayMenu()}
          </div>
        )}
      </div>
    );
  }
}

export default Dropdown;
