// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ERC20Token is ERC20 {
    constructor(string memory name, string memory symbol,uint256 amount) ERC20(name, symbol) {

        _mint(msg.sender, amount);
    }


    function sendTokens(address recipient, uint256 amount) public {
        require(recipient != address(0), "Invalid recipient address");
        require(amount > 0, "Amount must be greater than zero");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");

        _transfer(msg.sender, recipient, amount);
    }

    function increaseBalance(address account, uint256 amount) public {
        require(account != address(0), "Invalid address");
        _mint(account, amount);
    }

    function decreaseBalance(address account, uint256 amount) public {
        require(account != address(0), "Invalid address");
        require(balanceOf(account) >= amount, "Insufficient balance");
        _burn(account, amount);
    }

    function transferFromDifferentAccounts(address from, address to, uint256 amount) public {
        require(from != address(0) && to != address(0), "Invalid addresses");
        require(balanceOf(from) >= amount, "Insufficient balance");

        _transfer(from, to, amount);
    }
}
