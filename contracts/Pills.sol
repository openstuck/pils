// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Pills is ERC20, Ownable {
    event LogMarketingWallet(address _marketing_wallet);
    event LogTaxFee(uint _tax_fee);
    event LogTransferPaused(bool _is_transfer_paused);
    event LogExchanger(address _exchanger, bool _isExchanger);
    event LogIsWhitelisted(address _whitelisted, bool _Iswhitelisted);

    // initial supply is 1 billion
    uint private constant INITIAL_SUPPLY = 1000_000_000 * 10 ** 18;

    // max investor wallet is 2%
    uint public max_wallet = 2;

    // max exchanger wallet is 2%
    uint public max_exchanger_wallet = 30;

    // tax fee is 0 at first
    uint public tax_fee = 0;

    // address
    address public marketing_wallet =
        0x68B6d9Fd146926579b853c4ED3D3400B28B8ff57;

    // bool
    bool public is_transfer_paused = false;

    // mapping
    mapping(address => bool) public isExchanger;
    mapping(address => bool) public isWhitelisted;

    modifier valid_wallet(address _address) {
        require(_address != address(0), "Invalid address");
        _;
    }

    constructor() ERC20("Pills", "PILLS") {
        _mint(msg.sender, INITIAL_SUPPLY);
        isWhitelisted[msg.sender] = true;
        isWhitelisted[0xD8b6085b51CAe99b946173FCC701A95042733476] = true;
    }

    function update_marketing_wallet(
        address _marketing_wallet
    ) external onlyOwner valid_wallet(_marketing_wallet) {
        marketing_wallet = _marketing_wallet;
        emit LogMarketingWallet(_marketing_wallet);
    }

    function update_tax_fee(uint _tax_fee) external onlyOwner {
        // 0 < _tax_fee < 21
        require(_tax_fee >= 0 && _tax_fee < 21, "Invalid tax fee");
        tax_fee = _tax_fee;
        emit LogTaxFee(_tax_fee);
    }

    function update_transfer_paused(
        bool _is_transfer_paused
    ) external onlyOwner {
        require(
            _is_transfer_paused != is_transfer_paused,
            "not valid is_transfer_paused"
        );
        is_transfer_paused = _is_transfer_paused;
        emit LogTransferPaused(_is_transfer_paused);
    }

    function update_exchanger(
        address _exchanger,
        bool _isExchanger
    ) external onlyOwner {
        require(
            _isExchanger != isExchanger[_exchanger],
            "not valid _isExchanger"
        );
        isExchanger[_exchanger] = _isExchanger;
        emit LogExchanger(_exchanger, _isExchanger);
    }

    function update_whitelisted(
        address _whitelisted,
        bool _Iswhitelisted
    ) external onlyOwner {
        require(
            _Iswhitelisted != isWhitelisted[_whitelisted],
            "not valid _Iswhitelisted"
        );
        isWhitelisted[_whitelisted] = _Iswhitelisted;
        emit LogIsWhitelisted(_whitelisted, _Iswhitelisted);
    }

    // override transfer
    function _transfer(
        address from,
        address to,
        uint256 amount
    ) internal override {
        // check if from whitelisted
        if (isWhitelisted[from] == true) {
            return super._transfer(from, to, amount);
        }
        // check if paused
        if (is_transfer_paused) {
            revert("Transfer is paused");
        }

        // check destination wallet
        if (isWhitelisted[to] == true) {
            return super._transfer(from, to, amount);
        }

        // sell

        uint transfer_ammount = amount;

        if (isExchanger[to] == true) {
            // max exchager balance
            uint max_exchanger_balance = (INITIAL_SUPPLY *
                max_exchanger_wallet) / 100;
            // exchanger balance
            uint exchanger_balance = balanceOf(to);

            require(
                exchanger_balance + amount <= max_exchanger_balance,
                "Exchanger balance is full"
            );

            uint tax_fee_amount = (amount * tax_fee) / 100;
            super._transfer(from, marketing_wallet, tax_fee_amount);
            transfer_ammount = amount - tax_fee_amount;
        }

        if (isExchanger[from] == true) {
            // max balance
            uint dest_balance = balanceOf(to);

            require(
                dest_balance + amount <= (INITIAL_SUPPLY * max_wallet) / 100,
                "Destination wallet is full"
            );

            uint tax_fee_amount = (amount * tax_fee) / 100;
            super._transfer(from, marketing_wallet, tax_fee_amount);
            transfer_ammount = amount - tax_fee_amount;
        }

        // tax fee

        return super._transfer(from, to, transfer_ammount);
    }
}
