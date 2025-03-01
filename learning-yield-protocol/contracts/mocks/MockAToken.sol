// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockAToken is ERC20 {
    constructor() ERC20("Mock aUSDC", "aUSDC") {}

    function mint(address account, uint256 amount) public {
        _mint(account, amount);
    }
} 