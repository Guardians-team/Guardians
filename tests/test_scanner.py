
import pytest
from scanner import validate_target


def test_allow_localhost():

    assert validate_target(
        "http://127.0.0.1:5000"
    )


def test_allow_localhost_name():

    assert validate_target(
        "http://localhost:5000"
    )


def test_block_external_target():

    with pytest.raises(ValueError):
        validate_target(
            "https://example.com"
        )


def test_block_invalid_scheme():

    with pytest.raises(ValueError):
        validate_target(
            "ftp://localhost"
        )
