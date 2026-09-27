from pydantic import ValidationError


def test_basic_imports():
    from app.schemas.assistant import AssistantRequest
    from app.schemas.maharashtra_intelligence import ServiceSummary

    assert AssistantRequest(message="hello").language == "en"
    assert ServiceSummary(
        id="x",
        name="Demo",
        department_id="revenue",
        department_name="Revenue",
        category="Certificates",
        application_route="/services/demo",
    ).name == "Demo"


def test_assistant_message_limit():
    from app.schemas.assistant import AssistantRequest
    try:
        AssistantRequest(message="x" * 1001)
        assert False, "Expected validation error"
    except ValidationError:
        assert True
