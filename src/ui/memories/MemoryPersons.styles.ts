import { Assets } from '@assets/Assets'
import { CommonStyles as C } from '@components/common/common.styles'
import { AppColors } from '@ui/styles/AppStyles'
import { appStyled } from '@ui/styles/AppThemes'
import { takeColor, takeFont } from '@util/recipies.util'

export const MemoryPersonsStyles = {
  Container: appStyled(C.Safe)`
    background-color: ${takeColor('primaryLight')};
  `,
  Padding: appStyled.View`
    padding-vertical: 10px;
    padding-horizontal: 20px;
    flex: 1;
  `,
  AddPersonIcon: appStyled.Image.attrs({
    source: Assets.addUserIcon,
  })`
    tint-color: ${AppColors.primaryDark};
  `,
  PersonItemText: appStyled.Text`
    font-family: ${takeFont('NSemiBold')};
    color: ${takeColor('primaryDark')};
    font-size: 16px;
  `,
}
