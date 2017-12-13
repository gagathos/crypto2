'use strict';

const assert = require('assertthat');

const crypto2 = require('../../lib/crypto2');

suite('crypto2', () => {
  suite('createPassword', () => {
    test('returns a new random password with 32 bytes length.', done => {
      crypto2.createPassword((err, password) => {
        assert.that(err).is.null();
        assert.that(password.length).is.equalTo(32);
        done();
      });
    });
  });

  suite('createKeyPair', () => {
    test('returns a new key pair.', function (done) {
      this.timeout(15 * 1000);

      crypto2.createKeyPair((err, privateKey, publicKey) => {
        assert.that(err).is.null();
        assert.that(privateKey.indexOf('-----BEGIN RSA PRIVATE KEY-----')).is.equalTo(0);
        assert.that(publicKey.indexOf('-----BEGIN PUBLIC KEY-----')).is.equalTo(0);
        done();
      });
    });
  });

  suite('readPrivateKey', () => {
    test('reads a private key from a .pem file.', done => {
      crypto2.readPrivateKey('./test/units/privateKey.pem', (err, key) => {
        assert.that(err).is.null();
        assert.that(key.indexOf('-----BEGIN RSA PRIVATE KEY-----')).is.equalTo(0);
        done();
      });
    });
  });

  suite('readPublicKey', () => {
    test('reads a public key from a .pem file.', done => {
      crypto2.readPublicKey('./test/units/publicKey.pem', (err, key) => {
        assert.that(err).is.null();
        assert.that(key.indexOf('-----BEGIN PUBLIC KEY-----')).is.equalTo(0);
        done();
      });
    });
  });

  suite('encrypt', () => {
    suite('aes256cbc', () => {
      test('encrypts using the AES 256 CBC encryption standard.', done => {
        crypto2.encrypt.aes256cbc('the native web', 'secret', (err, encryptedText) => {
          assert.that(err).is.null();
          assert.that(encryptedText).is.equalTo('6c9ae06e9cd536bf38d0f551f8150065');
          done();
        });
      });
    });

    suite('rsa', () => {
      test('encrypts using the RSA encryption standard.', done => {
        crypto2.readPublicKey('./test/units/publicKey.pem', (errReadPublicKey, publicKey) => {
          assert.that(errReadPublicKey).is.null();
          crypto2.encrypt.rsa('the native web', publicKey, (errEncrypt, encrypted) => {
            assert.that(errEncrypt).is.null();
            crypto2.readPrivateKey('./test/units/privateKey.pem', (errReadPrivateKey, privateKey) => {
              assert.that(errReadPrivateKey).is.null();
              crypto2.decrypt.rsa(encrypted, privateKey, (errDecrypt, decrypted) => {
                assert.that(errDecrypt).is.null();
                assert.that(decrypted).is.equalTo('the native web');
                done();
              });
            });
          });
        });
      });
    });

    test('defaults to AES 256 CBC.', done => {
      crypto2.encrypt('the native web', 'secret', (errEncrypt1, actualEncryptedText) => {
        assert.that(errEncrypt1).is.null();
        crypto2.encrypt.aes256cbc('the native web', 'secret', (errEncrypt2, expectecEncryptedText) => {
          assert.that(errEncrypt2).is.null();
          assert.that(actualEncryptedText).is.equalTo(expectecEncryptedText);
          done();
        });
      });
    });
  });

  suite('decrypt', () => {
    suite('aes256cbc', () => {
      test('decrypts using the AES 256 CBC encryption standard.', done => {
        crypto2.decrypt.aes256cbc('6c9ae06e9cd536bf38d0f551f8150065', 'secret', (err, decryptedText) => {
          assert.that(err).is.null();
          assert.that(decryptedText).is.equalTo('the native web');
          done();
        });
      });

      test('throws an error when an invalid string is given.', done => {
        crypto2.decrypt.aes256cbc('this-is-not-encrypted', 'secret', err => {
          assert.that(err.message).is.equalTo('Bad input string');
          done();
        });
      });
    });

    suite('rsa', () => {
      test('decrypts using the RSA encryption standard.', done => {
        crypto2.readPublicKey('./test/units/publicKey.pem', (errReadPublicKey, publicKey) => {
          assert.that(errReadPublicKey).is.null();
          crypto2.encrypt.rsa('the native web', publicKey, (errEncrypt, encrypted) => {
            assert.that(errEncrypt).is.null();
            crypto2.readPrivateKey('./test/units/privateKey.pem', (errReadPrivateKey, privateKey) => {
              assert.that(errReadPrivateKey).is.null();
              crypto2.decrypt.rsa(encrypted, privateKey, (errDecrypt, decrypted) => {
                assert.that(errDecrypt).is.null();
                assert.that(decrypted).is.equalTo('the native web');
                done();
              });
            });
          });
        });
      });

      test('throws an error when an invalid string is given.', done => {
        crypto2.readPrivateKey('./test/units/privateKey.pem', (errReadPrivateKey, privateKey) => {
          assert.that(errReadPrivateKey).is.null();
          crypto2.decrypt.rsa('this-is-not-encrypted', privateKey, errDecrypt => {
            assert.that(errDecrypt.message).is.equalTo('Error during decryption (probably incorrect key). Original error: Error: Incorrect data or key');
            done();
          });
        });
      });
    });

    test('defaults to AES 256 CBC.', done => {
      crypto2.decrypt('6c9ae06e9cd536bf38d0f551f8150065', 'secret', (errDecrypt1, actualDecryptedText) => {
        assert.that(errDecrypt1).is.null();
        crypto2.decrypt.aes256cbc('6c9ae06e9cd536bf38d0f551f8150065', 'secret', (errDecrypt2, expectedDecryptedText) => {
          assert.that(errDecrypt2).is.null();
          assert.that(actualDecryptedText).is.equalTo(expectedDecryptedText);
          done();
        });
      });
    });
  });

  suite('sign', () => {
    suite('sha256', () => {
      test('signs using the SHA256 signing standard.', done => {
        crypto2.readPrivateKey('./test/units/privateKey.pem', (errReadPrivateKey, privateKey) => {
          assert.that(errReadPrivateKey).is.null();
          crypto2.sign.sha256('the native web', privateKey, (errSign, signature) => {
            assert.that(errSign).is.null();
            assert.that(signature).is.equalTo('af132a489e35ae89c7262fd19dfc78409f14066e0ee603922645b2292bb4661492f65a9bd5cb4de44ce8974c4edc1ef9826309ea6216209de95ef4f61453627d1bbc3ac0ef3cbe6d9aea9aa511b5d98a123a5a6f781e499026383e38b2b89a80785cf35db44409818cf6750dc4c33e8bad28cf6fb6d5cb8a6c863bbc8bba76c09b196965a55b52702378b3217efe42f83e77e4e54e41b8c1ca095fd914ee2da64bfd8d63321b7e41ed5d0f54ade1690b16759cbf32ffc871b67c3c904dfb9bc8072cc43fbb64cfdc9d94bd78401fa5a7dab0604f1eb27aa5467f8f61ea0f8ea9b6cac065d4bdfd0bfc1f3385e6a5482ff8a0b989b19be7ab9d310e459db3ef6d');
            done();
          });
        });
      });
    });

    test('defaults to SHA256.', done => {
      crypto2.readPrivateKey('./test/units/privateKey.pem', (errReadPrivateKey, privateKey) => {
        assert.that(errReadPrivateKey).is.null();
        crypto2.sign('the native web', privateKey, (errSign1, actualSignature) => {
          assert.that(errSign1).is.null();
          crypto2.sign.sha256('the native web', privateKey, (errSign2, expectedSignature) => {
            assert.that(errSign2).is.null();
            assert.that(actualSignature).is.equalTo(expectedSignature);
            done();
          });
        });
      });
    });
  });

  suite('verify', () => {
    suite('sha256', () => {
      test('verifies using the SHA256 signing standard.', done => {
        crypto2.readPublicKey('./test/units/publicKey.pem', (errReadPublicKey, publicKey) => {
          assert.that(errReadPublicKey).is.null();
          crypto2.verify.sha256('the native web', publicKey, 'af132a489e35ae89c7262fd19dfc78409f14066e0ee603922645b2292bb4661492f65a9bd5cb4de44ce8974c4edc1ef9826309ea6216209de95ef4f61453627d1bbc3ac0ef3cbe6d9aea9aa511b5d98a123a5a6f781e499026383e38b2b89a80785cf35db44409818cf6750dc4c33e8bad28cf6fb6d5cb8a6c863bbc8bba76c09b196965a55b52702378b3217efe42f83e77e4e54e41b8c1ca095fd914ee2da64bfd8d63321b7e41ed5d0f54ade1690b16759cbf32ffc871b67c3c904dfb9bc8072cc43fbb64cfdc9d94bd78401fa5a7dab0604f1eb27aa5467f8f61ea0f8ea9b6cac065d4bdfd0bfc1f3385e6a5482ff8a0b989b19be7ab9d310e459db3ef6d', (errVerify, isSignatureValid) => {
            assert.that(errVerify).is.null();
            assert.that(isSignatureValid).is.equalTo(true);
            done();
          });
        });
      });
    });

    test('defaults to SHA256.', done => {
      crypto2.readPublicKey('./test/units/publicKey.pem', (errReadPublicKey, publicKey) => {
        assert.that(errReadPublicKey).is.null();
        crypto2.verify('the native web', publicKey, '6c20e04d7dca6eeff43a7a618776d91d121204c698426b6d5f809d631be8d09ca02643af36f324008afc0d4e1cf0ba137c976afaa74bd559c1e1201694312ad98ae17a66de04812b1efe68c5b1c057f719ff111a938980e11292933074101fd5141d494c13484f45b1f710a2c041ae4ada27667ac3855492b49d77a0a64e6c406925e68b7ed55298ef4387e2884f3a021c6f76b4146607f32d657d070e78e86d43d068b17cca9873a666f572b0d078525446b7dd1ef30ae20b91161a5a9bab7123b56c35fac7d3ce9b749c524c62b5b3eb8e76445c9dfd80370daed8d53a4efdab0acb14a4875758b708b2da75a070db84ebd4bd4f3a073424df214aaf0b9914', (errVerify1, actualIsSignatureValid) => {
          assert.that(errVerify1).is.null();
          crypto2.verify.sha256('the native web', publicKey, '6c20e04d7dca6eeff43a7a618776d91d121204c698426b6d5f809d631be8d09ca02643af36f324008afc0d4e1cf0ba137c976afaa74bd559c1e1201694312ad98ae17a66de04812b1efe68c5b1c057f719ff111a938980e11292933074101fd5141d494c13484f45b1f710a2c041ae4ada27667ac3855492b49d77a0a64e6c406925e68b7ed55298ef4387e2884f3a021c6f76b4146607f32d657d070e78e86d43d068b17cca9873a666f572b0d078525446b7dd1ef30ae20b91161a5a9bab7123b56c35fac7d3ce9b749c524c62b5b3eb8e76445c9dfd80370daed8d53a4efdab0acb14a4875758b708b2da75a070db84ebd4bd4f3a073424df214aaf0b9914', (errVerify2, expectedIsSignatureValid) => {
            assert.that(errVerify2).is.null();
            assert.that(actualIsSignatureValid).is.equalTo(expectedIsSignatureValid);
            done();
          });
        });
      });
    });
  });

  suite('hash', () => {
    suite('md5', () => {
      test('calculates the MD5 hash value.', done => {
        crypto2.hash.md5('the native web', (err, hashedText) => {
          assert.that(err).is.null();
          assert.that(hashedText).is.equalTo('4e8ba2e64931c64b63f4dc8d90e1dc7c');
          done();
        });
      });
    });

    suite('sha1', () => {
      test('calculates the SHA1 hash value.', done => {
        crypto2.hash.sha1('the native web', (err, hashedText) => {
          assert.that(err).is.null();
          assert.that(hashedText).is.equalTo('cc762e69089ee2393b061ab26a005319bda94744');
          done();
        });
      });
    });

    suite('sha256', () => {
      test('calculates the SHA256 hash value.', done => {
        crypto2.hash.sha256('the native web', (err, hashedText) => {
          assert.that(err).is.null();
          assert.that(hashedText).is.equalTo('55a1f59420da66b2c4c87b565660054cff7c2aad5ebe5f56e04ae0f2a20f00a9');
          done();
        });
      });
    });

    test('defaults to SHA256.', done => {
      crypto2.hash('the native web', (errHash1, actualHashedText) => {
        assert.that(errHash1).is.null();
        crypto2.hash.sha256('the native web', (errHash2, expectedHashedText) => {
          assert.that(errHash2).is.null();
          assert.that(actualHashedText).is.equalTo(expectedHashedText);
          done();
        });
      });
    });
  });

  suite('hmac', () => {
    suite('sha1', () => {
      test('calculates the SHA1-based HMAC value.', done => {
        crypto2.hmac.sha1('the native web', 'secret', (err, hmacedText) => {
          assert.that(err).is.null();
          assert.that(hmacedText).is.equalTo('c9a6cdb2d350820e76a14f4f9a6392990ce1982a');
          done();
        });
      });
    });

    suite('sha256', () => {
      test('calculates the SHA256-based HMAC value.', done => {
        crypto2.hmac.sha256('the native web', 'secret', (err, hmacedText) => {
          assert.that(err).is.null();
          assert.that(hmacedText).is.equalTo('028e3043f9d848e346c8a93c4c29b091cb871065b6f5d1199f38e5a7360532f4');
          done();
        });
      });
    });

    test('defaults to SHA256.', done => {
      crypto2.hmac('the native web', 'secret', (errHmac1, actualHmacedText) => {
        assert.that(errHmac1).is.null();
        crypto2.hmac.sha256('the native web', 'secret', (errHmac2, expectedHmacedText) => {
          assert.that(errHmac2).is.null();
          assert.that(actualHmacedText).is.equalTo(expectedHmacedText);
          done();
        });
      });
    });
  });
});
