import React, { useState } from 'react';
import { string, number, bool, func } from 'prop-types';
import styled from 'styled-components';
import Trigger from 'rc-trigger';
import cx from 'classnames';
import { navigateTo } from 'router/navigateTo';
import SvgIcon from 'src/components/SvgIcon';
import { Menu, MenuItem, Icon, Tooltip } from 'ming-ui';
import { VerticalMiddle, FlexSpacer } from 'worksheet/components/Basics';

const GroupItemLink = styled.div`
  &.draggingItem > div {
    background: #f1f1f1;
  }
  &.isDragging:not(.draggingItem) {
    transition: ease 0.3s;
  }
`;

const GroupItemCon = styled.div`
  display: block;
  color: #333;
  font-size: 14px;
  cursor: pointer;
  height: 36px;
  padding: 0 14px;
  margin: 0 -14px;
  border-radius: 6px;
  background: #fff;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif,
    'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
  .name {
    margin-right: 4px;
  }
  .operate {
    display: none;
  }
  .num {
    min-width: 18px;
    text-align: center;
  }
  .star {
    &.isMarked,
    &:hover {
      color: #ffc400 !important;
    }
  }
  .visibleStar {
    color: #ffc400;
  }
  &.hover:not(.isDragging),
  &:hover:not(.isDragging) {
    .name {
      max-width: 88px;
    }
    .operate {
      display: flex;
    }
    .num {
      display: none;
    }
    .visibleStar {
      display: none;
    }
  }
  &.hover:not(.isDragging):not(.active),
  &:hover:not(.isDragging):not(.active) {
    background-color: #f5f5f5;
  }
  &.active {
    color: #2196f3;
    background-color: rgba(33, 150, 243, 0.1);
    .fontIcon {
      color: #2196f3 !important;
    }
    svg {
      fill: #2196f3;
    }
    .name {
      font-weight: 500;
    }
  }
  > div {
    height: 100%;
  }
`;

const MenuWrap = styled(Menu)`
  position: relative !important;
  overflow: auto;
  padding: 6px 0 !important;
  width: 200px !important;
  .ming.MenuItem.red .Item-content {
    color: #f44336 !important;
    .Icon {
      color: #f44336 !important;
    }
    &:not(.disabled):hover {
      background: #f51744 !important;
      color: #fff !important;
      .Icon {
        color: #fff !important;
      }
    }
  }
`;

const MenuItemWrap = styled(MenuItem)`
  .Item-content {
    padding-left: 47px !important;
  }
`;

const MoreBtnCon = styled(VerticalMiddle)`
  display: inline-flex;
  border-radius: 24px;
  justify-content: center;
  width: 24px;
  height: 24px;
  &:hover {
    background: rgba(0, 0, 0, 0.04);
  }
`;

const GroupItemIcon = styled(SvgIcon)`
  font-size: 0px;
  margin-right: 8px;
`;

export default function GroupItem(props) {
  const {
    isAdmin,
    isDragging,
    activeGroupId,
    projectId,
    className,
    active,
    itemType,
    id,
    groupType,
    fontIcon,
    icon,
    iconUrl,
    name,
    count,
    isMarked,
    onClick = () => {},
    onEdit = () => {},
    onDelete = () => {},
    onMark = () => {},
  } = props;
  const [menuVisible, setMenuVisible] = useState();
  const content = (
    <GroupItemCon
      className={cx(className, {
        hover: menuVisible,
        isDragging,
        active:
          active ||
          (activeGroupId &&
            activeGroupId === id &&
            (location.hash.startsWith('#star') ? itemType === 'star' : itemType !== 'star')),
      })}
      onClick={onClick}
    >
      <VerticalMiddle>
        {fontIcon ? (
          <i className={`fontIcon icon icon-${fontIcon} Font16 Gray_75 mRight8`} />
        ) : (
          <GroupItemIcon size={18} url={iconUrl || `https://fp1.mingdaoyun.cn/customIcon/${icon}.svg`} fill="#757575" />
        )}
        <span className="name ellipsis">{name}</span>
        {!_.includes(['static'], itemType) && (
          <React.Fragment>
            <FlexSpacer />
            <VerticalMiddle
              className="operate"
              onClick={e => {
                e.stopPropagation();
                e.preventDefault();
              }}
            >
              {(groupType === 0 || (groupType === 1 && isAdmin)) && itemType !== 'star' && (
                <Trigger
                  popupVisible={menuVisible}
                  onPopupVisibleChange={setMenuVisible}
                  action={['click']}
                  popupAlign={{
                    points: ['tl', 'bl'],
                    overflow: { adjustY: true },
                  }}
                  popup={
                    <MenuWrap>
                      <MenuItemWrap
                        onClick={() => {
                          setMenuVisible(false);
                          onEdit(id);
                        }}
                        icon={<Icon icon="edit" className="Font18 mLeft5" />}
                      >
                        {_l('编辑')}
                      </MenuItemWrap>
                      <MenuItemWrap
                        className="red"
                        icon={<Icon icon="trash" className="Font18 mLeft5" />}
                        onClick={() => {
                          setMenuVisible(false);
                          onDelete(id, groupType);
                        }}
                      >
                        {_l('删除')}
                      </MenuItemWrap>
                    </MenuWrap>
                  }
                >
                  <MoreBtnCon>
                    <i className="icon icon-more_horiz1 Font18 Gray_9e Hand"></i>
                  </MoreBtnCon>
                </Trigger>
              )}

              <Tooltip
                disableAnimation
                popupPlacement="right"
                text={<span>{isMarked ? _l('取消标星') : _l('标星，显示在首页')}</span>}
              >
                <i
                  className={cx(`star icon icon-${isMarked ? 'task-star' : 'star_outline'} Font18 Gray_9e mLeft5`, {
                    isMarked,
                  })}
                  onClick={() => onMark(id)}
                ></i>
              </Tooltip>
            </VerticalMiddle>
            {itemType !== 'star' && count !== 0 && <span className="num Gray_9e">{count}</span>}
            {itemType !== 'star' && isMarked && <i className={cx('visibleStar icon-task-star Font18  mLeft8')}></i>}
          </React.Fragment>
        )}
      </VerticalMiddle>
    </GroupItemCon>
  );
  if (id) {
    return (
      <GroupItemLink
        className={cx({ isDragging })}
        onClick={e => {
          navigateTo(`/app/my/group/${projectId}/${groupType}/${id}${itemType === 'star' ? '#star' : ''}`);
        }}
      >
        {content}
      </GroupItemLink>
    );
  } else {
    return content;
  }
}

GroupItem.propTypes = {
  isAdmin: bool,
  className: string,
  itemType: string,
  id: string,
  groupType: number,
  icon: string,
  fontIcon: string,
  iconUrl: string,
  name: string,
  count: number,
  isMarked: bool,
  onClick: func,
  onEdit: func,
  onDelete: func,
  onMark: func,
};
