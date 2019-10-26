import {Deserializable} from '../shared/deserializable.model';
import {Profile} from '../profile/profile.model';
import {Serializable} from '../shared/serializable.model';

export class Board implements Deserializable, Serializable {
  static MEMBER_ROLE_HIERARCHY: BoardMemberRole[] = [
    'viewer',
    'editor',
    'administrator',
    'owner'
  ];
  public id: string;
  public title: string;
  public description: string;
  public members: {
    [userId: string]: BoardMemberRole;
  };

  getRoleOfMember(member: Profile) {
    return this.members[member.uid];
  }

  isAllowedToRemoveMember(activeMember: Profile, passiveMember: Profile) {
    const hierarchyLevelOfActiveMember = Board.MEMBER_ROLE_HIERARCHY.indexOf(this.members[activeMember.uid]);
    // If the passiveMember has no role at all, hierarchyLevelOfOldRole will be -1 which makes sense.
    const hierarchyLevelOfPassiveMember = Board.MEMBER_ROLE_HIERARCHY.indexOf(this.members[passiveMember.uid]);
    return hierarchyLevelOfActiveMember > hierarchyLevelOfPassiveMember && this.isMemberTheOnlyOwner(passiveMember);
  }

  isMemberTheOnlyOwner(member: Profile): boolean {
    const memberIsNoOwnerAtAll = this.members[member.uid] !== 'owner';
    if (memberIsNoOwnerAtAll) {
      return false;
    }
    const otherMemberIds = Object.keys(this.members).filter(memberId => memberId !== member.uid);
    const isAtLeastOneOtherMemberOwner = otherMemberIds.some(memberId => this.members[memberId] === 'owner');
    return !isAtLeastOneOtherMemberOwner;
  }

  removeMember(member: Profile) {
    delete this.members[member.uid];
  }

  /**
   * Determines whether a member is allowed to set another members role to a certain value.
   * The operation is forbidden, if the other members role is higher than the role of the person executing the change
   * or the new role is higher than the role of the person executing the change.
   * This method does not care whether the active member has already a role or not.
   * @param activeMember the member actively trying to change someone else's role
   * @param passiveMember the passive member whose role is set by someone else
   * @param newRole the new role for the passiveMember
   */
  isMemberAllowedToSetOtherMembersRole(
    activeMember: Profile,
    passiveMember: Profile,
    newRole: BoardMemberRole
  ): boolean {
    const hierarchyLevelOfActiveMember = Board.MEMBER_ROLE_HIERARCHY.indexOf(this.members[activeMember.uid]);
    // If the passiveMember has no role at all, hierarchyLevelOfOldRole will be -1 which makes sense.
    const hierarchyLevelOfPassiveMember = Board.MEMBER_ROLE_HIERARCHY.indexOf(this.members[passiveMember.uid]);
    const hierarchyLevelOfNewRole = Board.MEMBER_ROLE_HIERARCHY.indexOf(newRole);
    // We are fine with the user degrading his own role.
    if (activeMember.uid === passiveMember.uid && hierarchyLevelOfPassiveMember >= hierarchyLevelOfNewRole) {
      return true;
    }
    // We are not fine with the user setting the role of somebody with an higher or equal role.
    if (hierarchyLevelOfPassiveMember >= hierarchyLevelOfActiveMember) {
      return false;
    }
    // We are not fine with user setting somebody else's role higher than his own role.
    return hierarchyLevelOfNewRole <= hierarchyLevelOfActiveMember;
  }

  /**
   * With this method, you can add new members to a board or change a members role.
   * @param member either a new member or an existing member whose role needs to be changed
   * @param newRole the new role of the member
   */
  setMemberRole(member: Profile, newRole: BoardMemberRole) {
    this.members[member.uid] = newRole;
  }

  deserialize(input: any): this {
    Object.assign(this, input);
    return this;
  }

  serialize(): any {
    return JSON.parse(JSON.stringify(this));
  }

  /**
   * Returns true if the member has the rights to delete this board.
   * @param member the member trying to delete this board
   */
  canBeDeletedByMember(member: Profile) {
    return this.members[member.uid] === 'owner';
  }
}

/**
 * This interface contains all values we need from the user for the creation of a board.
 */
export interface BoardBlueprint {
  title: string;
  description: string;
}

export type BoardMemberRole = 'owner' | 'administrator' | 'editor' | 'viewer';
