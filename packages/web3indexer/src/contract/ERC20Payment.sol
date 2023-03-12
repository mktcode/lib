// SPDX-License-Identifier: UNLICENSE
pragma solidity ^0.8.16;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

error ErrorMessage(string message);

contract ERC20Payments {
  uint256 queryFee = 0.0000001 ether;
  address payable owner;

  mapping(address => uint256) balances;

  constructor() {
    owner = payable(msg.sender);
  }

  function _topUp() internal {
    // coming soon
  }

  function topUp() public payable {
    _topUp();
  }

  receive() external payable {
    _topUp();
  }

  function withdraw(address from, uint256 queryCount, bytes calldata signature) public {
    uint256 amount = queryFee * queryCount;
    if (balances[from] < amount) revert ErrorMessage("Insufficient balance");
    balances[from] -= amount;

    bytes32 message = keccak256(abi.encodePacked(queryCount));
    address signer = recoverSigner(message, signature);
    if (signer != from) revert ErrorMessage("Invalid signature");

    // coming soon
  }

  function recoverSigner(bytes32 message, bytes memory signature) public pure returns (address) {
    bytes32 hash = ECDSA.toEthSignedMessageHash(message);
    address signer = ECDSA.recover(hash, signature);
    return signer;
  }
}
