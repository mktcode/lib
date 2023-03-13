// SPDX-License-Identifier: UNLICENSE
pragma solidity ^0.8.16;

error ErrorMessage(string message);

contract APILock {
  address payable owner;
  uint256 public fee = 0.1 ether;
  mapping (address => bool) public unlocked;

  event Unlock(address indexed user, uint256 amount);

  constructor() {
    owner = payable(msg.sender);
  }

  function _unlock() internal {
    if (unlocked[msg.sender]) revert ErrorMessage("Already unlocked");
    if (msg.value < fee) revert ErrorMessage("Insufficient funds");

    unlocked[msg.sender] = true;

    emit Unlock(msg.sender, msg.value);
  }

  function unlock() public payable {
    _unlock();
  }

  receive() external payable {
    _unlock();
  }
}
