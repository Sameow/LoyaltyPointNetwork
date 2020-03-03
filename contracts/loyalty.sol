pragma solidity ^0.5.0;

library SafeMathERC20 {

  /**
  * @dev Multiplies two numbers, throws on overflow.
  */
  function mul(uint256 a, uint256 b) internal pure returns (uint256 c) {
    if (a == 0) {
      return 0;
    }
    c = a * b;
    assert(c / a == b);
    return c;
  }

  /**
  * @dev Integer division of two numbers, truncating the quotient.
  */
  function div(uint256 a, uint256 b) internal pure returns (uint256) {
    // assert(b > 0); // Solidity automatically throws when dividing by 0
    // uint256 c = a / b;
    // assert(a == b * c + a % b); // There is no case in which this doesn't hold
    return a / b;
  }

  /**
  * @dev Subtracts two numbers, throws on overflow (i.e. if subtrahend is greater than minuend).
  */
  function sub(uint256 a, uint256 b) internal pure returns (uint256) {
    assert(b <= a);
    return a - b;
  }

  /**
  * @dev Adds two numbers, throws on overflow.
  */
  function add(uint256 a, uint256 b) internal pure returns (uint256 c) {
    c = a + b;
    assert(c >= a);
    return c;
  }
}

contract loyalty {
    using SafeMathERC20 for uint256;
    mapping (uint => mapping (address => uint256)) internal balances;
    //a customer (address) has uint256 Loyalty points from shopID (uint)

  address public _owner = msg.sender;

  struct shop{
      address shopOwner;
      uint pointsIssued;
  }

  shop[] public shops;

  event Redeem (
      uint shopId,
      uint point,
      uint transactionId
  );

  modifier onlyNetworkOwner() {
      require(msg.sender == _owner, "Must be network owner.");
      _;
  }

  modifier onlyShopOwner(uint shopId) {
      require(shops[shopId].shopOwner == msg.sender, "Shop ID have wrong shop owner.");
      _;
  }

  /* Customer can be any address, according to prof
  modifier onlyCustomer() {
      require(, "Customer must be an address.");
      _;
  }
  */

  function onboardShop(address shopOwner) public onlyNetworkOwner returns (uint shopId) {    //callable only by network owner
    //onboard shop owner
    shop memory newShop = shop(shopOwner, 0);
    shops.push(newShop);
    return (shops.length)-1; //position of shop in shops array
  }

  function issuePoint(uint shopId, uint point, address customer) onlyShopOwner(shopId) public{ //callable only by respective shop owner
    //issue points for own shop to customer
    shops[shopId].pointsIssued = shops[shopId].pointsIssued.add(point);
    balances[shopId][customer] = balances[shopId][customer].add(point);
  }

  function redeemPoint(uint shopId, uint point, uint transactionId) public{ //callable by customer using customer's balance
    //transactionId is random
    require(balances[shopId][msg.sender]>=point, "Not enough points to redeem");
    shops[shopId].pointsIssued = shops[shopId].pointsIssued.sub(point);
    balances[shopId][msg.sender] = balances[shopId][msg.sender].sub(point);
    emit Redeem(shopId, point, transactionId);
  }

  function transferPoint(uint shopId, uint point, address recipient) public{ //callable by customer
    //transfer point to another cust
    require(point <= balances[shopId][msg.sender]);
    balances[shopId][msg.sender] = balances[shopId][msg.sender].sub(point);
    balances[shopId][recipient] = balances[shopId][recipient].add(point);
  }

  function pointBalance(uint shopId, address customer) public view returns(uint256){ //balance of a customer's loyalty points of a shop
    return balances[shopId][customer];
  }

  function totalBalance(uint shopId) public view returns(uint){ //total points issued by a shop, less those redeemed
    return shops[shopId].pointsIssued;
  }

}