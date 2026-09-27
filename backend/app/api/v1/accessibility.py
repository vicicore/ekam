from fastapi import APIRouter

router = APIRouter(prefix="/accessibility", tags=["accessibility"])


@router.get("/metadata")
def accessibility_metadata():
    return {
        "keyboard_navigation": True,
        "focus_indicators": True,
        "reduced_motion": True,
        "high_contrast": True,
        "font_scaling": True,
        "responsive_layout": True,
        "note": "Frontend accessibility controls and semantics are the primary implementation."
    }
