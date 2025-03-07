import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import UserTable from './userTable';
import { Icon, LoadDiv, Checkbox, Dialog, Input } from 'ming-ui';
import { Pagination } from 'antd';
import {
  loadUsers,
  getFullTree,
  deleteDepartment,
  loadInactiveUsers,
  loadApprovalUsers,
  loadAllUsers,
} from '../../actions/entities';
import { updateCursor, updateTypeCursor, removeCursor, emptyUserSet } from '../../actions/current';
import userBoard from '../../modules/dialogUserBoard';
import JopList from './jobList';
import cx from 'classnames';
import { batchResetPassword } from 'src/api/user';
import RoleController from 'src/api/role';
import { encrypt } from 'src/util';

class UserList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      batchResetPasswordVisible: false,
      isSuperAdmin: false,
    };

    this.loadData(1);
  }

  componentDidMount() {
    this.getPermission();
  }

  loadData = pageIndex => {
    const { dispatch, departmentId, typeCursor, projectId } = this.props;
    if (!!departmentId) {
      dispatch(loadUsers(departmentId, pageIndex));
    } else {
      switch (typeCursor) {
        case 0:
          dispatch(loadAllUsers(projectId, pageIndex));
          break;
        case 1:
          dispatch(loadUsers(departmentId, pageIndex));
          break;
        case 2:
          dispatch(loadInactiveUsers(projectId, pageIndex));
          break;
        case 3:
          dispatch(loadApprovalUsers(projectId, pageIndex));
          break;
      }
    }
  };

  getPermission = () => {
    const { projectId } = this.props;
    RoleController.getProjectPermissionsByUser({
      projectId: projectId,
    }).then(data => {
      this.setState({ isSuperAdmin: data.isSuperAdmin });
    });
  };

  renderUserCount() {
    const { allCount } = this.props;
    return typeof allCount !== 'undefined' ? <span className="colorBD mLeft5 mRight15">{allCount}</span> : null;
  }

  renderUserTable() {
    const { isLoading } = this.props;
    return isLoading ? <LoadDiv /> : <UserTable />;
  }

  handleAdjustDepartment = () => {
    //所有？
    const { selectCount, selectedAccountIds, projectId, departmentId, isSearch, dispatch, isSelectAll, userList } =
      this.props;
    const _this = this;
    if (!selectCount) {
      return alert(_l('请选择用户调整'), 3);
    }
    userBoard({
      type: 'adjust',
      projectId,
      accountIds: selectedAccountIds,
      noFn() {
        dispatch(emptyUserSet());
      },
      yesFn() {
        dispatch(emptyUserSet());
        if (!isSearch && userList) {
          const { ids, pageIndex } = userList;
          const args = [ids].concat(selectedAccountIds);
          if (!_.without.apply(null, args).length) {
            // dispatch(loadUsers(departmentId, pageIndex > 1 ? (pageIndex - 1) : 1));
            _this.loadData(pageIndex > 1 ? pageIndex - 1 : 1);
          } else {
            // dispatch(loadUsers(departmentId, pageIndex));
            _this.loadData(pageIndex);
          }
        }
      },
    });
  };

  handleExportUser = () => {
    const { selectCount, selectedAccountIds, projectId, dispatch } = this.props;
    let isAll = selectCount === 0;
    userBoard({
      type: 'export',
      projectId,
      accountIds: isAll ? [] : selectedAccountIds,
      noFn() {
        dispatch(emptyUserSet());
      },
    });
  };

  batchChangePassword = () => {
    this.setState({ batchResetPasswordVisible: true });
  };
  resetPassword = () => {
    const { selectedAccountIds = [], projectId, dispatch } = this.props;
    let { password } = this.state;
    const { md = {} } = window;
    const { global = {} } = md;
    const { SysSettings = {} } = global;
    const { passwordRegexTip, passwordRegex } = SysSettings;
    if (_.isEmpty(password)) {
      alert(_l('请输入新密码'), 3);
      return;
    } else if (!RegExp.isPasswordRule(password, passwordRegex)) {
      alert(passwordRegexTip || _l('密码过于简单，至少8~20位且含字母+数字'), 3);
      return;
    }
    batchResetPassword({
      projectId,
      accountIds: selectedAccountIds,
      password: encrypt(password),
    }).then(result => {
      if (result) {
        alert(_l('修改成功'), 1);
        this.setState({ batchResetPasswordVisible: false, password: '' });
      } else {
        alert(_l('修改失败'), 2);
      }
      dispatch(emptyUserSet());
    });
  };

  renderUserTableWithNum = () => {
    const { selectedAccountIds = [], isSelectAll, typeCursor } = this.props;
    return (
      <React.Fragment>
        <span className="Font16 Gray">
          {!isSelectAll ? _l('已选择 %0 条', selectedAccountIds.length) : _l('已选择所有')}
        </span>
        <div className="actionBox">
          <span
            onClick={e => {
              this.handleAdjustDepartment();
            }}
            className="selectedAccountAction Hand Hover_49"
          >
            <Icon className="Font16 listName mRight12" icon="sp_filter_none_white" />
            {_l('调整部门')}
          </span>
          <span
            onClick={e => {
              this.handleExportUser();
            }}
            className="selectedAccountAction Hand mLeft40 Hover_49"
          >
            <Icon className="Font16 listName mRight12" icon="Export_user" />
            {_l('导出选中用户')}
          </span>
          {this.state.isSuperAdmin && (
            <span onClick={this.batchChangePassword} className="selectedAccountAction Hand mLeft40 Hover_49">
              {_l('批量重置密码')}
            </span>
          )}
        </div>
      </React.Fragment>
    );
  };
  itemRender(current, type, originalElement) {
    if (type === 'prev') {
      return <a className="page">{_l('上一页')}</a>;
    }
    if (type === 'next') {
      return <a className="page">{_l('下一页')}</a>;
    }
    return originalElement;
  }

  // 分页
  changPage = page => {
    this.loadData(page);
  };
  scroll = () => {
    if (this.tableContainer.scrollLeft !== 0) {
      $('.nameTh').addClass('tableColFixedLeft');
    } else {
      $('.nameTh').removeClass('tableColFixedLeft');
    }

    if (this.tableContainer.scrollWidth - this.tableContainer.scrollLeft === this.tableContainer.clientWidth) {
      $('.actTh').removeClass('tableColFixedRight');
    } else {
      $('.actTh').addClass('tableColFixedRight');
    }
  };
  render() {
    const {
      allCount,
      pageIndex,
      isSearch,
      typeNum = 0,
      projectId,
      departmentId,
      typeCursor = 0,
      selectedAccountIds = [],
      departmentName,
      dispatch,
      pageSize,
      isSelectAll,
    } = this.props;
    const { batchResetPasswordVisible, password } = this.state;
    const { SysSettings = {} } = global;
    const { passwordRegexTip, passwordRegex } = SysSettings;
    if (typeNum === 0) {
      //部门成员
      return (
        <div className={cx('departmentInfo', { approvalUser: typeCursor === 3 })}>
          <div className="userList">
            {!isSearch && (selectedAccountIds.length > 0 || isSelectAll) && typeCursor !== 2 && typeCursor !== 3 ? (
              <div className="Font15 departmentTitle">{this.renderUserTableWithNum()}</div>
            ) : (
              ''
            )}
            {typeCursor === 2 || typeCursor === 3 || (!isSearch && selectedAccountIds.length <= 0 && !isSelectAll) ? (
              <div className="Font15 departmentTitle">
                <span className="departmentNameValue" title={!!departmentId && departmentName}>
                  {!!departmentId && departmentName}
                </span>
                {(typeCursor === 0 || typeCursor === 1) && !departmentId && _l('全组织')}
                {/* {typeCursor === 1 && _l('未分配部门')} */}
                {typeCursor === 2 && _l('未激活')}
                {typeCursor === 3 && _l('待审核')}
                {this.renderUserCount()}
                {(typeCursor === 0 || typeCursor === 1) && !departmentId && (
                  <Checkbox
                    ref="example"
                    className="InlineBlock Gray_9e Font12 departmentName TxtMiddle LineHeight24 bgColorHover noDepartment"
                    defaultChecked={typeCursor === 1}
                    // id="1"
                    onClick={(checked, id) => {
                      dispatch(updateCursor(''));
                      if (checked) {
                        dispatch(updateTypeCursor(1));
                        dispatch(loadUsers('', 1));
                      } else {
                        dispatch(updateTypeCursor(0));
                        dispatch(loadAllUsers(projectId, 1));
                      }
                    }}
                  >
                    {_l('暂无部门')}
                  </Checkbox>
                )}
                {/* {this.renderSettingBtn()} */}
              </div>
            ) : (
              ''
            )}
            <div className="departmentContent" onScroll={this.scroll} ref={node => (this.tableContainer = node)}>
              {this.renderUserTable()}
            </div>
            {allCount > pageSize && (
              <div className="pagination">
                <Pagination
                  total={allCount}
                  itemRender={this.itemRender}
                  onChange={this.changPage}
                  current={pageIndex}
                  pageSize={pageSize || 50}
                />
              </div>
            )}
          </div>
          <Dialog
            title={_l('重置%0个用户密码', selectedAccountIds.length)}
            okText={_l('保存')}
            cancelText={_l('取消')}
            visible={batchResetPasswordVisible}
            onCancel={() => {
              this.setState({ batchResetPasswordVisible: false });
              dispatch(emptyUserSet());
            }}
            onOk={this.resetPassword}
          >
            <div className="Font15 Gray mTop20 mBottom10">{_l('请输入新密码')}</div>
            <Input
              className="w100"
              type="password"
              value={password}
              autoComplete="new-password"
              placeholder={passwordRegexTip || _l('密码，8-20位，必须含字母+数字')}
              onChange={value => {
                this.setState({ password: value });
              }}
            />
          </Dialog>
        </div>
      );
    } else {
      //职位成员
      return (
        <div className="jopInfo">
          <JopList />
        </div>
      );
    }
  }
}

const mapStateToProps = state => {
  const {
    current,
    pagination: { userList = [] },
  } = state;
  const { departmentId, root, projectId, typeNum, typeCursor, selectedAccountIds, isSelectAll } = current;
  const isRoot = departmentId === root;
  const { departments } = state.entities;
  const department = departments[departmentId];
  return {
    typeNum,
    typeCursor,
    selectedAccountIds,
    isRoot,
    departmentId,
    projectId,
    isSearch: userList && userList.isSearchResult,
    allCount: userList && userList.allCount,
    pageIndex: userList && userList.pageIndex,
    pageSize: userList && userList.pageSize,
    departmentName: department ? department.departmentName : '',
    selectCount: selectedAccountIds.length,
    isSelectAll,
    userList,
  };
};

const connectedUserList = connect(mapStateToProps)(UserList);

export default connectedUserList;
