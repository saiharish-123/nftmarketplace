import { useState } from 'react'
import { ethers } from "ethers"
import { Row, Form, Button, Card, ProgressBar } from 'react-bootstrap'
import { create } from 'ipfs-http-client'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
const client = create('https://ipfs.infura.io:5001/api/v0')
const pinataBaseUrl = 'https://api.pinata.cloud'
const PINATA_API_KEY = '3c47b95b69dbfbcf25bc'
const PINATA_SECRET_KEY = '53f37e65b093045f3bcc111fc7de0ac7eb297ede72ece92cc0b4a62810d97f90'

const Create = ({ marketplace, nft }) => {
  const [image, setImage] = useState('')
  const [price, setPrice] = useState(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [imageLoading,setimgloading] = useState(false)
  const [SbmitLoading,setSloading] = useState(false)
  const navigate = useNavigate();
  const uploadToIPFS = async (event) => {
    event.preventDefault()
    const file = event.target.files[0]
    const formData = new FormData()
    formData.append('file', file, file.name)
    try {
      const { data: responseData } = await axios.post(`${pinataBaseUrl}/pinning/pinFileToIPFS`, formData, {
        headers: {
          'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_SECRET_KEY
        }
      })
      console.log(responseData)
      const url = `https://ipfs.io/ipfs/${responseData.IpfsHash}?filename=${file.name}`
      console.log(url)
      setimgloading(false)
      setImage(url)
    } catch (error) {
      setimgloading(false)
      console.log(error)
    }
  }
  const createNFT = async () => {
    // console.log({image,price,name,description})
    if (!image || !price || !name || !description) return alert("enter all details")
    try {
      const { data: responseData } = await axios.post(`${pinataBaseUrl}/pinning/pinJSONToIPFS`, {
        image,price,name,description
      }, {
        headers: {
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_SECRET_KEY
        }
      })
      const url = `https://ipfs.io/ipfs/${responseData.IpfsHash}?filename=${name}`
      mintThenList(url)
      // console.log(url)
    } catch (error) {
      console.log(error.response.data)
    }
    // try{
    //   const result = await client.add(JSON.stringify({image, price, name, description}))
    //   mintThenList(result)
    // } catch(error) {
    //   console.log("ipfs uri upload error: ", error)
    // }
  }
  const mintThenList = async (result) => {
    console.log(result)
    const uri = result
    // mint nft 
    await(await nft.mint(uri)).wait()
    // get tokenId of new nft 
    const id = await nft.tokenCount()
    // approve marketplace to spend nft
    await(await nft.setApprovalForAll(marketplace.address, true)).wait()
    // add nft to marketplace
    const listingPrice = ethers.utils.parseEther(price.toString())
    await(await marketplace.makeItem(nft.address, id, listingPrice)).wait()
    setSloading(false)
    navigate('/')
  }
  return (
    <div className="container-fluid mt-5">
      <div className="row">
        <main role="main" className="col-lg-12 mx-auto" style={{ maxWidth: '1000px' }}>
          <div className="content mx-auto">
            <Row className="g-4">
              <Form.Control
                type="file"
                disabled={imageLoading}
                required
                name="file"
                onChange={e=>{
                  setimgloading(true)
                  uploadToIPFS(e)
                }}
              />
              {imageLoading ? <ProgressBar animated now={100} /> : ''}
              <Form.Control onChange={(e) => setName(e.target.value)} size="lg" required type="text" placeholder="Name" />
              <Form.Control onChange={(e) => setDescription(e.target.value)} size="lg" required as="textarea" placeholder="Description" />
              <Form.Control onChange={(e) => setPrice(e.target.value)} size="lg" required type="number" placeholder="Price in ETH" />
              <div className="d-grid px-0">
                <Button onClick={e=>{
                  setSloading(true)
                  createNFT(e)
                }} disabled={SbmitLoading} variant="primary" size="lg">
                  {!SbmitLoading ? "Create & List NFT!" : "Creating NFT....."}
                </Button>
              </div>
            </Row>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Create